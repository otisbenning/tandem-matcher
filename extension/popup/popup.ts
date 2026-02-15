// Popup Script - UI for Chrome Extension
import type { Profile, ProfileExport, ExtensionMessage, ExtensionResponse } from '@shared/types';

// Extended Profile type with completeness
interface StoredProfile extends Profile {
  hasHauptprofil: boolean;
  hasInterview: boolean;
  isComplete: boolean;
}

// DOM Elements
const profileList = document.getElementById('profileList')!;
const profileCount = document.getElementById('profileCount')!;
const scanAllBtn = document.getElementById('scanAllBtn')!;
const scanCurrentBtn = document.getElementById('scanCurrentBtn')!;
const copyBtn = document.getElementById('copyBtn')! as HTMLButtonElement;
const downloadBtn = document.getElementById('downloadBtn')! as HTMLButtonElement;
const importBtn = document.getElementById('importBtn')!;
const importInput = document.getElementById('importInput')! as HTMLInputElement;
const clearBtn = document.getElementById('clearBtn')! as HTMLButtonElement;
const statusEl = document.getElementById('status')!;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProfiles();
  setupEventListeners();
});

function setupEventListeners(): void {
  scanAllBtn.addEventListener('click', handleScanAll);
  scanCurrentBtn.addEventListener('click', handleScanCurrent);
  copyBtn.addEventListener('click', handleCopy);
  downloadBtn.addEventListener('click', handleDownload);
  importBtn.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', handleImport);
  clearBtn.addEventListener('click', handleClear);
}

// Load and display profiles
async function loadProfiles(): Promise<void> {
  const response = await sendMessage({ type: 'GET_PROFILES' });
  const profiles = (response.data as StoredProfile[]) || [];

  renderProfiles(profiles);
  updateButtons(profiles.length);
}

function renderProfiles(profiles: StoredProfile[]): void {
  const total = profiles.length;
  const complete = profiles.filter(p => p.isComplete).length;
  const incomplete = total - complete;

  profileCount.textContent = String(total);
  profileCount.title = `${complete} vollständig, ${incomplete} unvollständig`;

  if (profiles.length === 0) {
    profileList.innerHTML = `
      <p class="empty-state">
        Noch keine Profile gesammelt.<br>
        Öffne Profile auf portal.startwithafriend.de und klicke "Scannen".
      </p>
    `;
    return;
  }

  // Sort: incomplete first, then by name
  const sorted = [...profiles].sort((a, b) => {
    if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  profileList.innerHTML = sorted
    .map(profile => {
      const statusClass = profile.isComplete ? 'complete' : 'incomplete';
      const statusIcon = profile.isComplete ? '✅' : '⚠️';
      const statusText = getStatusText(profile);

      return `
        <div class="profile-item ${statusClass}" data-id="${profile.id}">
          <div class="profile-info">
            <div class="profile-name">${statusIcon} ${escapeHtml(profile.name)}</div>
            <div class="profile-meta">
              <span class="profile-status">${statusText}</span>
              <span class="profile-fields">${profile.fields.length} Felder</span>
            </div>
          </div>
          <button class="delete-btn" data-id="${profile.id}" title="Löschen">×</button>
        </div>
      `;
    })
    .join('');

  // Add delete handlers
  profileList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) handleDelete(id);
    });
  });
}

function getStatusText(profile: StoredProfile): string {
  if (profile.isComplete) {
    return 'Vollständig';
  }

  const missing: string[] = [];
  if (!profile.hasHauptprofil) missing.push('Hauptprofil');
  if (!profile.hasInterview) missing.push('Interview');

  return `Fehlt: ${missing.join(', ')}`;
}

function updateButtons(count: number): void {
  const hasProfiles = count > 0;
  copyBtn.disabled = !hasProfiles;
  downloadBtn.disabled = !hasProfiles;
  clearBtn.disabled = !hasProfiles;
}

// Scan all tabs
async function handleScanAll(): Promise<void> {
  scanAllBtn.textContent = 'Scanne...';
  scanAllBtn.setAttribute('disabled', 'true');

  try {
    const response = await sendMessage({ type: 'SCAN_ALL_TABS' });
    const result = response.data as { scanned: number; added: number; merged: number };

    showStatus(`${result.scanned} Tabs, ${result.added} neu, ${result.merged} aktualisiert`, 'success');
    loadProfiles();
  } catch (error) {
    showStatus('Fehler beim Scannen', 'error');
  } finally {
    scanAllBtn.innerHTML = '<span class="icon">🔍</span> Alle Tabs scannen';
    scanAllBtn.removeAttribute('disabled');
  }
}

// Scan current tab
async function handleScanCurrent(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id || !tab.url?.includes('portal.startwithafriend.de')) {
      showStatus('Bitte öffne eine Seite auf portal.startwithafriend.de', 'error');
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, { type: 'SCAN_ALL_TABS' });

    if (response?.success && response.data) {
      await sendMessage({ type: 'PROFILE_EXTRACTED', payload: response.data });
      showStatus('Profil erfolgreich gescannt!', 'success');
      loadProfiles();
    } else {
      showStatus('Kein Profil auf dieser Seite gefunden', 'error');
    }
  } catch (error) {
    showStatus('Fehler: Seite neu laden (F5)', 'error');
  }
}

// Copy to clipboard
async function handleCopy(): Promise<void> {
  const response = await sendMessage({ type: 'GET_PROFILES' });
  const profiles = (response.data as StoredProfile[]) || [];

  // Only export complete profiles
  const completeProfiles = profiles.filter(p => p.isComplete);

  if (completeProfiles.length === 0) {
    showStatus('Keine vollständigen Profile zum Exportieren', 'error');
    return;
  }

  const exportData: ProfileExport = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    profiles: completeProfiles,
  };

  try {
    await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    showStatus(`${completeProfiles.length} Profile kopiert!`, 'success');
  } catch (error) {
    showStatus('Fehler beim Kopieren', 'error');
  }
}

// Download as file
async function handleDownload(): Promise<void> {
  const response = await sendMessage({ type: 'GET_PROFILES' });
  const profiles = (response.data as StoredProfile[]) || [];

  const exportData: ProfileExport = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    profiles: profiles,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  const filename = `tandem-profile_${date}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);

  const complete = profiles.filter(p => p.isComplete).length;
  showStatus(`${profiles.length} Profile (${complete} vollständig)`, 'success');
}

// Import from file
async function handleImport(e: Event): Promise<void> {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text) as ProfileExport;

    if (!data.profiles || !Array.isArray(data.profiles)) {
      throw new Error('Ungültiges Format');
    }

    let added = 0;
    let merged = 0;
    for (const profile of data.profiles) {
      if (!profile.id) profile.id = crypto.randomUUID();
      if (!profile.timestamp) profile.timestamp = Date.now();

      const response = await sendMessage({ type: 'PROFILE_EXTRACTED', payload: profile });
      if (response.data?.isNew) {
        added++;
      } else {
        merged++;
      }
    }

    showStatus(`${added} neu, ${merged} aktualisiert`, 'success');
    loadProfiles();
  } catch (error) {
    showStatus('Fehler: ' + (error as Error).message, 'error');
  }

  importInput.value = '';
}

// Delete single profile
async function handleDelete(id: string): Promise<void> {
  const response = await sendMessage({ type: 'GET_PROFILES' });
  const profiles = (response.data as StoredProfile[]) || [];
  const filtered = profiles.filter(p => p.id !== id);

  await chrome.storage.local.set({ tandem_profiles: filtered });

  showStatus('Profil gelöscht', 'success');
  loadProfiles();
}

// Clear all profiles
async function handleClear(): Promise<void> {
  if (!confirm('Alle Profile wirklich löschen?')) return;

  await sendMessage({ type: 'CLEAR_PROFILES' });
  showStatus('Alle Profile gelöscht', 'success');
  loadProfiles();
}

// Helper: Send message to background script
function sendMessage(message: ExtensionMessage): Promise<ExtensionResponse> {
  return chrome.runtime.sendMessage(message);
}

// Helper: Show status message
function showStatus(message: string, type: 'success' | 'error'): void {
  statusEl.textContent = message;
  statusEl.className = `status visible ${type}`;

  setTimeout(() => {
    statusEl.classList.remove('visible');
  }, 3000);
}

// Helper: Escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
