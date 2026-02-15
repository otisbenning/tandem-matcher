// SmartMatchPanel Component - Show compatible/incompatible matches
import type { Profile, SmartMatchResult } from '@shared/types';
import { getProfiles, getProfileById, getMatchedProfileIds, getTandemForProfile } from '../services/storage';
import { calculateMatchResult } from '../services/matching';
import { extractPLZ } from '../utils/helpers';
import { getDistanceBetweenPLZ } from '../services/geocoding';
import { updateMarkerStyles } from './MapView';

let selectedProfile: Profile | null = null;
let matchResults: SmartMatchResult[] = [];

export function initSmartMatch(): void {
  const panel = document.getElementById('smartMatchPanel');
  const closeBtn = document.getElementById('closeSmartMatch');

  closeBtn?.addEventListener('click', () => {
    hidePanel();
    window.dispatchEvent(new CustomEvent('profile-deselected'));
  });

  // Listen for profile selection
  window.addEventListener('profile-selected', async (e: Event) => {
    const customEvent = e as CustomEvent<{ profileId: string; profile: Profile }>;
    selectedProfile = customEvent.detail.profile;

    // Check if selected profile is already matched
    const tandem = getTandemForProfile(selectedProfile.id);
    if (tandem) {
      // Already matched - trigger edit tandem modal instead
      window.dispatchEvent(new CustomEvent('edit-tandem', {
        detail: { tandemId: tandem.id, tandem, profileId: selectedProfile.id }
      }));
      selectedProfile = null;
      return;
    }

    await calculateMatches();
    showPanel();
    updateMapMarkers();
  });

  window.addEventListener('profile-deselected', () => {
    selectedProfile = null;
    matchResults = [];
    hidePanel();
  });
}

async function calculateMatches(): Promise<void> {
  if (!selectedProfile) return;

  const profiles = getProfiles();
  const matchedIds = getMatchedProfileIds();
  const results: SmartMatchResult[] = [];

  for (const profile of profiles) {
    if (profile.id === selectedProfile.id) continue;

    // Skip profiles that are already matched (one tandem per person rule)
    if (matchedIds.has(profile.id)) {
      continue;
    }

    const matchResult = calculateMatchResult(selectedProfile, profile);

    // Calculate distance
    const plz1 = extractPLZ(selectedProfile);
    const plz2 = extractPLZ(profile);
    let distance: number | undefined;
    let distanceText: string | undefined;

    if (plz1 && plz2) {
      distance = await getDistanceBetweenPLZ(plz1, plz2);
      if (distance !== undefined) {
        distanceText = distance < 1 ? '<1 km' : `${Math.round(distance)} km`;
      }
    }

    results.push({
      profile,
      matchResult,
      distance,
      distanceText,
    });
  }

  // Sort: compatible first (by score desc), then incompatible
  results.sort((a, b) => {
    if (a.matchResult.compatible !== b.matchResult.compatible) {
      return a.matchResult.compatible ? -1 : 1;
    }
    if (a.matchResult.compatible) {
      return b.matchResult.score - a.matchResult.score;
    }
    return 0;
  });

  matchResults = results;
}

function showPanel(): void {
  const panel = document.getElementById('smartMatchPanel');
  const nameElement = document.getElementById('selectedProfileName');
  const contentElement = document.getElementById('smartMatchContent');

  if (!panel || !nameElement || !contentElement || !selectedProfile) return;

  nameElement.textContent = selectedProfile.name;
  contentElement.innerHTML = renderMatchResults();
  panel.classList.add('visible');

  // Add click handlers
  contentElement.querySelectorAll('.match-item').forEach(item => {
    item.addEventListener('click', () => {
      const profileId = item.getAttribute('data-profile-id');
      if (profileId) {
        handleMatchClick(profileId);
      }
    });
  });
}

function hidePanel(): void {
  const panel = document.getElementById('smartMatchPanel');
  panel?.classList.remove('visible');
}

function renderMatchResults(): string {
  if (matchResults.length === 0) {
    return '<p class="empty-state">Keine anderen Profile zum Matchen vorhanden.</p>';
  }

  const compatible = matchResults.filter(r => r.matchResult.compatible);
  const incompatible = matchResults.filter(r => !r.matchResult.compatible);

  let html = '';

  // Compatible matches
  if (compatible.length > 0) {
    html += '<div class="match-section"><h4>Passende Matches</h4>';
    html += compatible.map(r => renderMatchItem(r, true)).join('');
    html += '</div>';
  }

  // Incompatible matches
  if (incompatible.length > 0) {
    html += '<div class="match-section"><h4>Unpassend (Hard Facts)</h4>';
    html += incompatible.map(r => renderMatchItem(r, false)).join('');
    html += '</div>';
  }

  return html;
}

function renderMatchItem(result: SmartMatchResult, compatible: boolean): string {
  const { profile, matchResult, distanceText } = result;
  const stars = renderStars(matchResult.score);

  // Build detailed reason text for incompatible matches
  let reasonHtml = '';
  if (!compatible && matchResult.failReason) {
    const reasonIcons: Record<string, string> = {
      age_preference: '🎂',
      gender_preference: '⚧️',
      time_overlap: '⏰',
      same_group: '👥',
    };
    const reasonLabels: Record<string, string> = {
      age_preference: 'Alter-Präferenz',
      gender_preference: 'Geschlecht-Präferenz',
      time_overlap: 'Keine Zeit-Überschneidung',
      same_group: 'Gleiche Gruppe',
    };
    const icon = reasonIcons[matchResult.failReason] || '⚠️';
    const label = reasonLabels[matchResult.failReason] || matchResult.failReason;

    // Add details if available
    let details = '';
    if (matchResult.failDetails) {
      details = `<div class="reason-details">${escapeHtml(matchResult.failDetails)}</div>`;
    }

    reasonHtml = `
      <div class="reason-box">
        <span class="reason-icon">${icon}</span>
        <span class="reason-label">${label}</span>
        ${details}
      </div>
    `;
  }

  // Show positive factors for compatible matches
  let factorsHtml = '';
  if (compatible && matchResult.positiveFactors && matchResult.positiveFactors.length > 0) {
    factorsHtml = `
      <div class="positive-factors">
        ${matchResult.positiveFactors.slice(0, 2).map(f => `<span class="factor">✓ ${escapeHtml(f)}</span>`).join('')}
      </div>
    `;
  }

  return `
    <div class="match-item ${compatible ? '' : 'incompatible'}" data-profile-id="${profile.id}">
      <div class="stars">${compatible ? stars : '---'}</div>
      <div class="info">
        <div class="name">${escapeHtml(profile.name)}</div>
        <div class="match-meta">
          ${distanceText ? `<span class="distance">📍 ${distanceText}</span>` : ''}
        </div>
        ${factorsHtml}
        ${reasonHtml}
      </div>
    </div>
  `;
}

function renderStars(score: number): string {
  let html = '';
  for (let i = 0; i < 5; i++) {
    html += `<span class="star ${i < score ? '' : 'empty'}">★</span>`;
  }
  return html;
}

function handleMatchClick(profileId: string): void {
  const profile = getProfileById(profileId);
  if (!profile || !selectedProfile) return;

  // Open match modal
  window.dispatchEvent(new CustomEvent('create-match', {
    detail: {
      profile1: selectedProfile,
      profile2: profile,
    },
  }));
}

function updateMapMarkers(): void {
  const compatible: string[] = [];
  const incompatible: string[] = [];
  const topMatches: string[] = [];

  for (const result of matchResults) {
    if (result.matchResult.compatible) {
      compatible.push(result.profile.id);
      if (result.matchResult.score >= 4) {
        topMatches.push(result.profile.id);
      }
    } else {
      incompatible.push(result.profile.id);
    }
  }

  updateMarkerStyles(compatible, incompatible, topMatches);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
