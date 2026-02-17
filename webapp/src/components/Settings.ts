// Settings Component - Export & Settings Tab
import { getTandems, getProfiles, createBackup, restoreBackup, getGamificationStats, deleteProfile, clearProfiles, getMatchedProfileIds, getCustomPrompt, saveCustomPrompt, clearCustomPrompt } from '../services/storage';
import { DEFAULT_PROMPT } from '../services/ollama';
import type { Tandem, Profile } from '@shared/types';

export function initSettings(): void {
  const exportExcelBtn = document.getElementById('exportExcel');
  const exportCSVBtn = document.getElementById('exportCSV');
  const exportJSONBtn = document.getElementById('exportJSON');
  const importBackupBtn = document.getElementById('importBackup');
  const manageProfilesBtn = document.getElementById('manageProfilesBtn');
  const deleteAllProfilesBtn = document.getElementById('deleteAllProfilesBtn');

  exportExcelBtn?.addEventListener('click', exportAsExcel);
  exportCSVBtn?.addEventListener('click', exportAsCSV);
  exportJSONBtn?.addEventListener('click', exportAsJSON);
  importBackupBtn?.addEventListener('click', importBackupFile);
  manageProfilesBtn?.addEventListener('click', showProfileManageModal);
  deleteAllProfilesBtn?.addEventListener('click', deleteAllProfiles);

  initPromptEditor();
  renderStats();
  window.addEventListener('tandems-updated', renderStats);
  window.addEventListener('profiles-updated', renderStats);
}

function renderStats(): void {
  const container = document.getElementById('statsContainer');
  if (!container) return;

  const profiles = getProfiles();
  const tandems = getTandems();
  const stats = getGamificationStats();

  const avgScore = tandems.length > 0
    ? (tandems.reduce((sum, t) => sum + t.matchScore, 0) / tandems.length).toFixed(1)
    : '-';

  container.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Profile:</span>
      <span class="stat-value">${profiles.length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Tandems:</span>
      <span class="stat-value">${tandems.length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Durchschn. Match-Qualität:</span>
      <span class="stat-value">${avgScore} ★</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Gesamtpunkte:</span>
      <span class="stat-value">${stats.totalPoints}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Streak:</span>
      <span class="stat-value">${stats.streak} Tage</span>
    </div>
  `;
}

async function exportAsExcel(): Promise<void> {
  const tandems = getTandems();
  if (tandems.length === 0) {
    alert('Keine Tandems zum Exportieren vorhanden.');
    return;
  }

  try {
    // Dynamic import of xlsx library
    const XLSX = await import('xlsx');

    const data = tandems.map(t => ({
      'Tandem': t.name,
      'Person 1': t.profile1.name,
      'Person 2': t.profile2.name,
      'Match-Score': t.matchScore,
      'Erstellt': new Date(t.created).toLocaleDateString('de-DE'),
      'Gemeinsamkeiten': t.commonalities.map(c => c.commonality).join('; '),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tandems');

    const fileName = `tandems_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Excel export error:', error);
    alert('Fehler beim Excel-Export. Bitte versuche den CSV-Export.');
  }
}

function exportAsCSV(): void {
  const tandems = getTandems();
  if (tandems.length === 0) {
    alert('Keine Tandems zum Exportieren vorhanden.');
    return;
  }

  const headers = ['Tandem', 'Person 1', 'Person 2', 'Match-Score', 'Erstellt', 'Gemeinsamkeiten'];
  const rows = tandems.map(t => [
    t.name,
    t.profile1.name,
    t.profile2.name,
    String(t.matchScore),
    new Date(t.created).toLocaleDateString('de-DE'),
    t.commonalities.map(c => c.commonality).join('; '),
  ]);

  const csv = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';')),
  ].join('\n');

  downloadFile(csv, `tandems_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8');
}

function exportAsJSON(): void {
  const backup = createBackup();
  downloadFile(backup, `tandem-matcher-backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}

function importBackupFile(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = event.target?.result as string;
        if (confirm('Achtung: Alle bestehenden Daten werden überschrieben. Fortfahren?')) {
          restoreBackup(backup);
          alert('Backup erfolgreich wiederhergestellt!');
          location.reload();
        }
      } catch (error) {
        alert('Fehler beim Wiederherstellen: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Delete all profiles
function deleteAllProfiles(): void {
  const profiles = getProfiles();
  if (profiles.length === 0) {
    alert('Keine Profile vorhanden.');
    return;
  }

  const confirmed = confirm(`Möchtest du wirklich ALLE ${profiles.length} Profile löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!`);
  if (confirmed) {
    const doubleConfirm = confirm('Bist du sicher? Alle Profile werden unwiderruflich gelöscht.');
    if (doubleConfirm) {
      clearProfiles();
      window.dispatchEvent(new Event('profiles-updated'));
      alert('Alle Profile wurden gelöscht.');
    }
  }
}

// Show modal for managing individual profiles
function showProfileManageModal(): void {
  const profiles = getProfiles();
  const matchedIds = getMatchedProfileIds();

  if (profiles.length === 0) {
    alert('Keine Profile vorhanden.');
    return;
  }

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal visible';
  modal.id = 'profileManageModal';

  function renderProfileList(): string {
    const currentProfiles = getProfiles();
    const currentMatchedIds = getMatchedProfileIds();

    return currentProfiles.map(profile => {
      const isMatched = currentMatchedIds.has(profile.id);
      const group = profile.group === 'local' ? 'Local' : 'Newcomer';
      const groupClass = profile.group === 'local' ? 'local' : 'newcomer';

      return `
        <div class="profile-manage-item ${isMatched ? 'matched' : ''}" data-id="${profile.id}">
          <div class="profile-manage-info">
            <span class="profile-manage-name">${escapeHtml(profile.name)}</span>
            <span class="profile-manage-group ${groupClass}">${group}</span>
            ${isMatched ? '<span class="profile-manage-badge">In Tandem</span>' : ''}
          </div>
          <button class="btn btn-sm btn-danger profile-delete-btn" data-id="${profile.id}" ${isMatched ? 'disabled title="Profil ist in einem Tandem"' : ''}>
            Löschen
          </button>
        </div>
      `;
    }).join('');
  }

  modal.innerHTML = `
    <div class="modal-content modal-lg">
      <div class="modal-header">
        <h2>Profile verwalten</h2>
        <button class="close-btn" id="closeProfileManageModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="profile-manage-header">
          <p><strong>${profiles.length}</strong> Profile geladen</p>
          <div class="profile-manage-actions">
            <input type="text" id="profileSearchInput" placeholder="Name suchen..." class="profile-search-input">
          </div>
        </div>
        <div class="profile-manage-list" id="profileManageList">
          ${renderProfileList()}
        </div>
        <div class="profile-manage-footer">
          <button class="btn btn-secondary" id="closeProfileManageBtn">Schließen</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  const closeBtn = modal.querySelector('#closeProfileManageModal');
  const closeFooterBtn = modal.querySelector('#closeProfileManageBtn');
  const searchInput = modal.querySelector('#profileSearchInput') as HTMLInputElement;
  const listContainer = modal.querySelector('#profileManageList');

  function closeModal(): void {
    modal.remove();
  }

  closeBtn?.addEventListener('click', closeModal);
  closeFooterBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Search functionality
  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const items = listContainer?.querySelectorAll('.profile-manage-item');
    items?.forEach(item => {
      const name = item.querySelector('.profile-manage-name')?.textContent?.toLowerCase() || '';
      (item as HTMLElement).style.display = name.includes(query) ? 'flex' : 'none';
    });
  });

  // Delete buttons
  listContainer?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('profile-delete-btn') && !target.hasAttribute('disabled')) {
      const profileId = target.dataset.id;
      if (!profileId) return;

      const profileName = target.closest('.profile-manage-item')?.querySelector('.profile-manage-name')?.textContent || 'Unbekannt';
      const confirmed = confirm(`Profil "${profileName}" wirklich löschen?`);

      if (confirmed) {
        deleteProfile(profileId);
        window.dispatchEvent(new Event('profiles-updated'));

        // Update the list
        if (listContainer) {
          listContainer.innerHTML = renderProfileList();
        }

        // Update header count
        const header = modal.querySelector('.profile-manage-header p');
        const remainingProfiles = getProfiles();
        if (header) {
          header.innerHTML = `<strong>${remainingProfiles.length}</strong> Profile geladen`;
        }

        // Close modal if no profiles left
        if (remainingProfiles.length === 0) {
          closeModal();
          alert('Alle Profile wurden gelöscht.');
        }
      }
    }
  });
}

function escapeHtml(text: string): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Prompt Editor
function initPromptEditor(): void {
  const promptTextarea = document.getElementById('promptTextarea') as HTMLTextAreaElement;
  const savePromptBtn = document.getElementById('savePromptBtn');
  const resetPromptBtn = document.getElementById('resetPromptBtn');
  const promptStatus = document.getElementById('promptStatus');

  if (!promptTextarea || !savePromptBtn || !resetPromptBtn) return;

  // Load current prompt
  const customPrompt = getCustomPrompt();
  promptTextarea.value = customPrompt || DEFAULT_PROMPT;

  // Update status indicator
  updatePromptStatus(promptStatus, !!customPrompt);

  // Save button
  savePromptBtn.addEventListener('click', () => {
    const newPrompt = promptTextarea.value.trim();
    if (newPrompt) {
      saveCustomPrompt(newPrompt);
      updatePromptStatus(promptStatus, true);
      showTemporaryMessage(promptStatus, 'Gespeichert!', 'success');
    }
  });

  // Reset button
  resetPromptBtn.addEventListener('click', () => {
    if (confirm('Prompt auf Standard zur�cksetzen?')) {
      clearCustomPrompt();
      promptTextarea.value = DEFAULT_PROMPT;
      updatePromptStatus(promptStatus, false);
      showTemporaryMessage(promptStatus, 'Zur�ckgesetzt!', 'info');
    }
  });
}

function updatePromptStatus(statusEl: HTMLElement | null, isCustom: boolean): void {
  if (!statusEl) return;
  if (isCustom) {
    statusEl.textContent = 'Eigener Prompt aktiv';
    statusEl.className = 'prompt-status custom';
  } else {
    statusEl.textContent = 'Standard-Prompt aktiv';
    statusEl.className = 'prompt-status default';
  }
}

function showTemporaryMessage(statusEl: HTMLElement | null, message: string, type: string): void {
  if (!statusEl) return;
  const originalText = statusEl.textContent;
  const originalClass = statusEl.className;
  statusEl.textContent = message;
  statusEl.className = 'prompt-status ' + type;
  setTimeout(() => {
    statusEl.textContent = originalText;
    statusEl.className = originalClass;
  }, 2000);
}
