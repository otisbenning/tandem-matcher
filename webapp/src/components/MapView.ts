// MapView Component - Leaflet Map Integration
import type { Profile } from '@shared/types';
import { getProfiles, getMatchedProfileIds, getTandemForProfile } from '../services/storage';
import { extractPLZ, extractGroup, extractAge, extractGender } from '../utils/helpers';
import { getCoordinatesForPLZ } from '../services/geocoding';

declare const L: typeof import('leaflet');

let map: L.Map | null = null;
let markers: Map<string, L.Marker> = new Map();
let selectedProfileId: string | null = null;

export function initMap(): void {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  // Initialize Leaflet map centered on Germany
  map = L.map('map').setView([51.1657, 10.4515], 6);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  // Load profiles and add markers
  loadProfileMarkers();

  // Listen for profile updates
  window.addEventListener('profiles-updated', loadProfileMarkers);
  window.addEventListener('tandems-updated', updateMatchedMarkers);
  window.addEventListener('profile-selected', (e: Event) => {
    const customEvent = e as CustomEvent<{ profileId: string }>;
    selectProfileOnMap(customEvent.detail.profileId);
  });
  window.addEventListener('profile-deselected', () => {
    deselectAllMarkers();
  });
}

// Update markers to show matched status
function updateMatchedMarkers(): void {
  const matchedIds = getMatchedProfileIds();

  markers.forEach((marker, id) => {
    const iconElement = marker.getElement()?.querySelector('.marker-icon');
    if (iconElement) {
      if (matchedIds.has(id)) {
        iconElement.classList.add('matched');
      } else {
        iconElement.classList.remove('matched');
      }
    }
  });
}

async function loadProfileMarkers(): Promise<void> {
  if (!map) return;

  // Clear existing markers
  markers.forEach(marker => marker.remove());
  markers.clear();

  const profiles = getProfiles();
  const plzGroups: Map<string, Profile[]> = new Map();

  // Group profiles by PLZ
  for (const profile of profiles) {
    const plz = extractPLZ(profile);
    if (plz) {
      if (!plzGroups.has(plz)) {
        plzGroups.set(plz, []);
      }
      plzGroups.get(plz)!.push(profile);
    }
  }

  // Create markers for each PLZ group
  for (const [plz, groupProfiles] of plzGroups) {
    const coords = await getCoordinatesForPLZ(plz);
    // Skip if no coords or invalid coords (NaN)
    if (!coords || !isFinite(coords.lat) || !isFinite(coords.lng)) continue;

    // Add offset for multiple profiles at same PLZ
    for (let i = 0; i < groupProfiles.length; i++) {
      const profile = groupProfiles[i];
      const offset = getMarkerOffset(i, groupProfiles.length);
      const lat = coords.lat + offset.lat;
      const lng = coords.lng + offset.lng;

      const marker = createProfileMarker(profile, lat, lng);
      marker.addTo(map);
      markers.set(profile.id, marker);
    }
  }
}

function getMarkerOffset(index: number, total: number): { lat: number; lng: number } {
  if (total === 1) return { lat: 0, lng: 0 };

  // Small offset for visual separation of markers at same PLZ (~100-200m)
  // 0.001 degree ≈ 111 meters
  const baseRadius = 0.002; // ~220 meters
  const spiralExpansion = 0.001 * Math.floor(index / 8);
  const radius = baseRadius + spiralExpansion;

  // Use golden angle for better distribution
  const goldenAngle = 2.399963;
  const angle = index * goldenAngle;

  return {
    lat: radius * Math.cos(angle),
    lng: radius * Math.sin(angle) * 1.4,
  };
}

function createProfileMarker(profile: Profile, lat: number, lng: number): L.Marker {
  const group = extractGroup(profile);
  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Check if profile is already matched
  const matchedIds = getMatchedProfileIds();
  const isMatched = matchedIds.has(profile.id);
  const matchedClass = isMatched ? 'matched' : '';

  const icon = L.divIcon({
    className: 'marker-wrapper',
    html: `<div class="marker-icon ${group} ${matchedClass}" data-profile-id="${profile.id}">${initials}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  const marker = L.marker([lat, lng], { icon });

  // Build detailed popup content (including tandem info if matched)
  const popupContent = buildProfilePopup(profile, group, isMatched);
  marker.bindPopup(popupContent, { maxWidth: 300 });

  // Click handler - select profile for matching
  marker.on('click', () => {
    window.dispatchEvent(new CustomEvent('profile-clicked', { detail: { profileId: profile.id } }));
  });

  return marker;
}

function buildProfilePopup(profile: Profile, group: string, isMatched: boolean = false): string {
  const age = extractAge(profile);
  const plz = extractPLZ(profile);
  const gender = extractGender(profile);

  // Get some relevant fields
  const hobbies = getFieldValue(profile, ['hobby', 'hobbies', 'freizeit', 'interessen']);
  const languages = getFieldValue(profile, ['sprache', 'sprachen', 'language']);
  const job = getFieldValue(profile, ['beruf', 'arbeit', 'job', 'tätigkeit', 'beschäftigung']);

  const genderText = gender === 'male' ? 'M' : gender === 'female' ? 'W' : gender === 'other' ? 'D' : '';
  const groupText = group === 'local' ? 'Local' : 'Newcomer';
  const groupClass = group === 'local' ? 'local' : 'newcomer';

  let html = `
    <div class="marker-popup">
      <div class="popup-header">
        <strong>${escapeHtml(profile.name)}</strong>
        <span class="group-badge ${groupClass}">${groupText}</span>
        ${isMatched ? '<span class="matched-badge">✓ Vermittelt</span>' : ''}
      </div>
      <div class="popup-meta">
        ${age ? `<span>${age} Jahre</span>` : ''}
        ${genderText ? `<span>${genderText}</span>` : ''}
        ${plz ? `<span>PLZ ${plz}</span>` : ''}
      </div>
  `;

  // Show tandem partner if matched
  if (isMatched) {
    const tandem = getTandemForProfile(profile.id);
    if (tandem) {
      const partnerName = tandem.profile1.id === profile.id
        ? tandem.profile2.name
        : tandem.profile1.name;
      html += `<div class="popup-field tandem-info"><strong>Tandem mit:</strong> ${escapeHtml(partnerName)}</div>`;
    }
  }

  if (job) {
    html += `<div class="popup-field"><strong>Beruf:</strong> ${escapeHtml(truncate(job, 50))}</div>`;
  }
  if (languages) {
    html += `<div class="popup-field"><strong>Sprachen:</strong> ${escapeHtml(truncate(languages, 80))}</div>`;
  }
  if (hobbies) {
    html += `<div class="popup-field"><strong>Interessen:</strong> ${escapeHtml(truncate(hobbies, 80))}</div>`;
  }

  html += `
      <div class="popup-action">
        ${isMatched ? '<em>Bereits vermittelt</em>' : '<em>Klicken für Smart Match</em>'}
      </div>
    </div>
  `;

  return html;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getFieldValue(profile: Profile, patterns: string[]): string | null {
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'i');
    const field = profile.fields.find(f => regex.test(f.question));
    if (field?.answer) return field.answer;
  }
  return null;
}

function selectProfileOnMap(profileId: string): void {
  selectedProfileId = profileId;

  markers.forEach((marker, id) => {
    const iconElement = marker.getElement()?.querySelector('.marker-icon');
    if (iconElement) {
      iconElement.classList.toggle('selected', id === profileId);
    }
  });

  // Center map on selected profile
  const selectedMarker = markers.get(profileId);
  if (selectedMarker && map) {
    map.setView(selectedMarker.getLatLng(), Math.max(map.getZoom(), 10));
  }
}

function deselectAllMarkers(): void {
  selectedProfileId = null;
  markers.forEach(marker => {
    const iconElement = marker.getElement()?.querySelector('.marker-icon');
    if (iconElement) {
      iconElement.classList.remove('selected', 'compatible', 'incompatible', 'top-match');
    }
  });
}

// Update marker styles based on match compatibility
export function updateMarkerStyles(
  compatibleIds: string[],
  incompatibleIds: string[],
  topMatchIds: string[]
): void {
  markers.forEach((marker, id) => {
    if (id === selectedProfileId) return;

    const iconElement = marker.getElement()?.querySelector('.marker-icon');
    if (iconElement) {
      iconElement.classList.remove('compatible', 'incompatible', 'top-match');

      if (topMatchIds.includes(id)) {
        iconElement.classList.add('compatible', 'top-match');
      } else if (compatibleIds.includes(id)) {
        iconElement.classList.add('compatible');
      } else if (incompatibleIds.includes(id)) {
        iconElement.classList.add('incompatible');
      }
    }
  });
}

export function getMap(): L.Map | null {
  return map;
}

export function invalidateMapSize(): void {
  if (map) {
    setTimeout(() => {
      map?.invalidateSize();
    }, 100);
  }
}

// Listen for resize events (for mobile view toggle)
window.addEventListener('map-needs-resize', invalidateMapSize);
