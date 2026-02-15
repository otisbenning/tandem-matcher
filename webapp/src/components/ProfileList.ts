// ProfileList Component - Sidebar Profile List
import type { Profile, ProfileFilter } from '@shared/types';
import { getProfiles, getProfileById, getMatchedProfileIds, getTandemForProfile } from '../services/storage';
import { extractPLZ, extractGroup, extractAge, extractGender } from '../utils/helpers';

let currentFilter: ProfileFilter = {};
let selectedProfileIds: Set<string> = new Set();
let manualMatchMode = false; // Mode for selecting two profiles manually

export function initProfileList(): void {
  renderProfileList();
  renderManualMatchButton();

  // Filter listeners
  const genderFilter = document.getElementById('filter-gender') as HTMLSelectElement;
  const groupFilter = document.getElementById('filter-group') as HTMLSelectElement;
  const searchFilter = document.getElementById('filter-search') as HTMLInputElement;

  genderFilter?.addEventListener('change', () => {
    currentFilter.gender = genderFilter.value as ProfileFilter['gender'];
    renderProfileList();
  });

  groupFilter?.addEventListener('change', () => {
    currentFilter.group = groupFilter.value as ProfileFilter['group'];
    renderProfileList();
  });

  searchFilter?.addEventListener('input', () => {
    currentFilter.searchText = searchFilter.value;
    renderProfileList();
  });

  // Listen for updates
  window.addEventListener('profiles-updated', renderProfileList);
  window.addEventListener('tandems-updated', renderProfileList);
  window.addEventListener('profile-clicked', (e: Event) => {
    const customEvent = e as CustomEvent<{ profileId: string }>;
    toggleProfileSelection(customEvent.detail.profileId);
  });
}

// Render manual match button in sidebar header
function renderManualMatchButton(): void {
  const sidebarHeader = document.querySelector('.sidebar-header');
  if (!sidebarHeader) return;

  // Check if button already exists
  if (document.getElementById('manualMatchBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'manualMatchBtn';
  btn.className = 'btn btn-sm';
  btn.innerHTML = '👆 Manuell matchen';
  btn.title = 'Zwei Profile zum Matchen auswählen';

  btn.addEventListener('click', () => {
    manualMatchMode = !manualMatchMode;
    selectedProfileIds.clear();
    window.dispatchEvent(new CustomEvent('profile-deselected'));
    updateManualMatchButton();
    renderProfileList();
  });

  sidebarHeader.appendChild(btn);
}

function updateManualMatchButton(): void {
  const btn = document.getElementById('manualMatchBtn');
  if (!btn) return;

  if (manualMatchMode) {
    btn.classList.add('active');
    btn.innerHTML = selectedProfileIds.size === 0
      ? '✋ Wähle 2 Profile...'
      : selectedProfileIds.size === 1
        ? '✋ Noch 1 wählen...'
        : '✅ Matchen!';
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '👆 Manuell matchen';
  }
}

function renderProfileList(): void {
  const container = document.getElementById('profileList');
  const countElement = document.getElementById('profileCount');
  if (!container) return;

  const profiles = getFilteredProfiles();
  if (countElement) countElement.textContent = String(profiles.length);

  if (profiles.length === 0) {
    container.innerHTML = '<p class="empty-state">Keine Profile gefunden. Importiere Profile über den Button oben.</p>';
    return;
  }

  container.innerHTML = profiles.map(profile => createProfileCard(profile)).join('');

  // Add click handlers
  container.querySelectorAll('.profile-card').forEach(card => {
    card.addEventListener('click', () => {
      const profileId = card.getAttribute('data-profile-id');
      if (profileId) {
        toggleProfileSelection(profileId);
      }
    });
  });
}

function getFilteredProfiles(): Profile[] {
  let profiles = getProfiles();

  // Apply filters
  if (currentFilter.gender && currentFilter.gender !== 'all') {
    profiles = profiles.filter(p => {
      const gender = extractGender(p);
      return gender === currentFilter.gender;
    });
  }

  if (currentFilter.group && currentFilter.group !== 'all') {
    profiles = profiles.filter(p => {
      const group = extractGroup(p);
      return group === currentFilter.group;
    });
  }

  if (currentFilter.searchText) {
    const search = currentFilter.searchText.toLowerCase();
    profiles = profiles.filter(p => {
      const plz = extractPLZ(p) || '';
      return p.name.toLowerCase().includes(search) || plz.includes(search);
    });
  }

  return profiles;
}

function createProfileCard(profile: Profile): string {
  const plz = extractPLZ(profile) || '-';
  const group = extractGroup(profile);
  const age = extractAge(profile);
  const isSelected = selectedProfileIds.has(profile.id);
  const matchedIds = getMatchedProfileIds();
  const isMatched = matchedIds.has(profile.id);
  const tandem = isMatched ? getTandemForProfile(profile.id) : null;
  const partnerName = tandem
    ? (tandem.profile1.id === profile.id ? tandem.profile2.name : tandem.profile1.name)
    : null;

  // Show selection number in manual match mode
  const selectionNumber = manualMatchMode && isSelected
    ? Array.from(selectedProfileIds).indexOf(profile.id) + 1
    : 0;

  return `
    <div class="profile-card ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''} ${manualMatchMode ? 'manual-mode' : ''}" data-profile-id="${profile.id}">
      ${selectionNumber > 0 ? `<div class="selection-number">${selectionNumber}</div>` : ''}
      <div class="name">${escapeHtml(profile.name)}</div>
      <div class="meta">
        <span class="group-badge ${group}">${group === 'local' ? 'Local' : 'Newcomer'}</span>
        <span>PLZ: ${plz}</span>
        ${age ? `<span>${age} Jahre</span>` : ''}
      </div>
      ${isMatched ? `
        <div class="matched-info">
          <span class="matched-badge">✓ Vermittelt</span>
          ${partnerName ? `<span class="partner-name">mit ${escapeHtml(partnerName.split(' ')[0])}</span>` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function toggleProfileSelection(profileId: string): void {
  const profile = getProfileById(profileId);
  if (!profile) return;

  // Check if profile is already matched
  const tandem = getTandemForProfile(profileId);
  if (tandem && !manualMatchMode) {
    // Profile is already matched - show edit/dissolve options
    window.dispatchEvent(new CustomEvent('edit-tandem', {
      detail: { tandemId: tandem.id, tandem, profileId }
    }));
    return;
  }

  // MANUAL MATCH MODE: Allow selecting two profiles
  if (manualMatchMode) {
    if (selectedProfileIds.has(profileId)) {
      selectedProfileIds.delete(profileId);
    } else {
      // Max 2 profiles in manual mode
      if (selectedProfileIds.size >= 2) {
        // Replace oldest selection
        const oldest = Array.from(selectedProfileIds)[0];
        selectedProfileIds.delete(oldest);
      }
      selectedProfileIds.add(profileId);
    }

    updateManualMatchButton();

    // If we have 2 profiles selected, trigger match creation
    if (selectedProfileIds.size === 2) {
      const ids = Array.from(selectedProfileIds);
      const profile1 = getProfileById(ids[0]);
      const profile2 = getProfileById(ids[1]);

      if (profile1 && profile2) {
        // Check if either is already matched
        const tandem1 = getTandemForProfile(profile1.id);
        const tandem2 = getTandemForProfile(profile2.id);

        if (tandem1 || tandem2) {
          alert('Eines der Profile ist bereits in einem Tandem. Bitte zuerst das bestehende Tandem auflösen.');
          return;
        }

        window.dispatchEvent(new CustomEvent('create-match', {
          detail: { profile1, profile2 }
        }));

        // Reset manual mode after match
        manualMatchMode = false;
        selectedProfileIds.clear();
        updateManualMatchButton();
      }
    }

    renderProfileList();
    return;
  }

  // SMART MATCH MODE: Single selection
  if (selectedProfileIds.has(profileId)) {
    selectedProfileIds.delete(profileId);
    window.dispatchEvent(new CustomEvent('profile-deselected', { detail: { profileId } }));
  } else {
    // Clear previous selection if we already have one (single select for smart match)
    if (selectedProfileIds.size > 0) {
      const prevId = Array.from(selectedProfileIds)[0];
      selectedProfileIds.clear();
      window.dispatchEvent(new CustomEvent('profile-deselected', { detail: { profileId: prevId } }));
    }

    selectedProfileIds.add(profileId);
    window.dispatchEvent(new CustomEvent('profile-selected', { detail: { profileId, profile } }));
  }

  renderProfileList();
}

export function getSelectedProfiles(): Profile[] {
  return Array.from(selectedProfileIds)
    .map(id => getProfileById(id))
    .filter((p): p is Profile => p !== undefined);
}

export function clearSelection(): void {
  selectedProfileIds.clear();
  window.dispatchEvent(new CustomEvent('profile-deselected'));
  renderProfileList();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
