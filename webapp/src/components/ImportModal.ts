// ImportModal Component - Profile Import UI
import type { ProfileExport } from '@shared/types';
import { importData, addProfiles } from '../services/storage';

let pendingImport: ProfileExport | null = null;

export function initImportModal(): void {
  const modal = document.getElementById('importModal');
  const importBtn = document.getElementById('importBtn');
  const closeBtn = document.getElementById('closeImportModal');
  const pasteBtn = document.getElementById('pasteClipboard');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const cancelBtn = document.getElementById('cancelImport');
  const confirmBtn = document.getElementById('confirmImport');
  const preview = document.getElementById('importPreview');

  // Open modal
  importBtn?.addEventListener('click', () => showModal());
  closeBtn?.addEventListener('click', () => hideModal());

  // Close on backdrop click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  // Paste from clipboard
  pasteBtn?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      processImportData(text);
    } catch (error) {
      alert('Fehler beim Lesen der Zwischenablage. Bitte erlaube den Zugriff.');
    }
  });

  // File drop zone
  dropZone?.addEventListener('click', () => fileInput?.click());

  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone?.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file) handleFile(file);
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) handleFile(file);
  });

  // Confirm/Cancel
  cancelBtn?.addEventListener('click', () => {
    pendingImport = null;
    if (preview) preview.hidden = true;
  });

  confirmBtn?.addEventListener('click', () => {
    if (pendingImport) {
      try {
        const totalInImport = pendingImport.profiles.length;
        const countNew = importData(pendingImport);
        const countSkipped = totalInImport - countNew;

        let message = `${countNew} neue Profile importiert!`;
        if (countSkipped > 0) {
          message += `\n${countSkipped} Duplikate übersprungen (bereits vorhanden).`;
        }
        alert(message);
        hideModal();
      } catch (error) {
        alert('Fehler beim Import: ' + (error as Error).message);
      }
    }
  });

  // Listen for clipboard import events
  window.addEventListener('import-from-clipboard', (e: Event) => {
    const customEvent = e as CustomEvent<string>;
    showModal();
    processImportData(customEvent.detail);
  });
}

function showModal(): void {
  const modal = document.getElementById('importModal');
  const preview = document.getElementById('importPreview');
  modal?.classList.add('visible');
  if (preview) preview.hidden = true;
  pendingImport = null;
}

function hideModal(): void {
  const modal = document.getElementById('importModal');
  modal?.classList.remove('visible');
  pendingImport = null;
}

function handleFile(file: File): void {
  if (!file.name.endsWith('.json')) {
    alert('Bitte eine JSON-Datei auswählen.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    processImportData(text);
  };
  reader.onerror = () => {
    alert('Fehler beim Lesen der Datei.');
  };
  reader.readAsText(file);
}

function processImportData(text: string): void {
  try {
    // Try to parse as JSON
    let data: ProfileExport;

    // Check for legacy format (SWAF_PROFILE_START...END)
    if (text.includes('SWAF_PROFILE_START')) {
      data = parseLegacyFormat(text);
    } else {
      data = JSON.parse(text);
    }

    // Validate structure
    if (!data.profiles || !Array.isArray(data.profiles)) {
      throw new Error('Ungültiges Format: profiles Array nicht gefunden');
    }

    pendingImport = data;
    showPreview(data);
  } catch (error) {
    alert('Fehler beim Verarbeiten der Daten: ' + (error as Error).message);
  }
}

function parseLegacyFormat(text: string): ProfileExport {
  const profiles: ProfileExport['profiles'] = [];
  const regex = /SWAF_PROFILE_START([\s\S]*?)SWAF_PROFILE_END/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    try {
      const profileData = JSON.parse(match[1].trim());
      profiles.push({
        id: crypto.randomUUID(),
        url: profileData.url || '',
        name: profileData.name || 'Unbekannt',
        pageType: profileData.pageType || 'Hauptprofil',
        timestamp: profileData.timestamp || Date.now(),
        fields: profileData.fields || [],
      });
    } catch {
      // Skip invalid profiles
    }
  }

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    profiles,
  };
}

function showPreview(data: ProfileExport): void {
  const preview = document.getElementById('importPreview');
  const countElement = document.getElementById('previewCount');
  const listElement = document.getElementById('previewList');

  if (!preview || !countElement || !listElement) return;

  countElement.textContent = String(data.profiles.length);

  listElement.innerHTML = data.profiles
    .slice(0, 10)
    .map(p => `<div class="preview-item">${escapeHtml(p.name)} (${p.fields.length} Felder)</div>`)
    .join('');

  if (data.profiles.length > 10) {
    listElement.innerHTML += `<div class="preview-item">... und ${data.profiles.length - 10} weitere</div>`;
  }

  preview.hidden = false;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
