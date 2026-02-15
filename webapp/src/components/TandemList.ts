// TandemList Component - Manage created tandems
import type { Tandem, Profile } from '@shared/types';
import { getTandems, addTandem, deleteTandem, updateTandem, getTandemById } from '../services/storage';
import { calculateMatchResult } from '../services/matching';
import { initTandemEditor, getEditorContent, getEditorCommonalities } from './TandemEditor';

export function initTandemList(): void {
  renderTandemList();

  // Listen for updates
  window.addEventListener('tandems-updated', renderTandemList);

  // Listen for match creation
  window.addEventListener('create-match', (e: Event) => {
    const customEvent = e as CustomEvent<{ profile1: Profile; profile2: Profile }>;
    showMatchModal(customEvent.detail.profile1, customEvent.detail.profile2);
  });

  // Listen for edit tandem request (from clicking matched profile)
  window.addEventListener('edit-tandem', (e: Event) => {
    const customEvent = e as CustomEvent<{ tandemId: string; tandem: Tandem }>;
    showEditTandemModal(customEvent.detail.tandem);
  });

  // Modal handlers
  const closeBtn = document.getElementById('closeMatchModal');
  const cancelBtn = document.getElementById('cancelMatch');
  const confirmBtn = document.getElementById('confirmMatch');

  closeBtn?.addEventListener('click', hideMatchModal);
  cancelBtn?.addEventListener('click', hideMatchModal);
  confirmBtn?.addEventListener('click', confirmMatchCreation);
}

function renderTandemList(): void {
  const container = document.getElementById('tandemList');
  if (!container) return;

  const tandems = getTandems();

  if (tandems.length === 0) {
    container.innerHTML = '<p class="empty-state">Noch keine Tandems erstellt. Wähle zwei Profile aus, um ein Tandem zu erstellen.</p>';
    return;
  }

  container.innerHTML = tandems
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .map(tandem => renderTandemCard(tandem))
    .join('');

  // Add delete handlers
  container.querySelectorAll('.delete-tandem').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tandemId = btn.getAttribute('data-tandem-id');
      if (tandemId && confirm('Tandem wirklich löschen?')) {
        deleteTandem(tandemId);
      }
    });
  });

  // Add copy handlers
  container.querySelectorAll('.copy-tandem').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tandemId = btn.getAttribute('data-tandem-id');
      if (tandemId) {
        copyTandemText(tandemId);
      }
    });
  });
}

function copyTandemText(tandemId: string): void {
  const tandems = getTandems();
  const tandem = tandems.find(t => t.id === tandemId);
  if (!tandem) return;

  // Use suggestionText if available (contains full formatted text)
  if (tandem.suggestionText) {
    navigator.clipboard.writeText(tandem.suggestionText).then(() => {
      showSuccessMessageInList('Text kopiert!');
    }).catch(() => {
      alert('Fehler beim Kopieren');
    });
    return;
  }

  // Otherwise, generate formatted text from commonalities (table format like original app)
  const name1 = extractFirstName(tandem.profile1.name);
  const name2 = extractFirstName(tandem.profile2.name);

  let text = `Hi ${name1} und ${name2},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;

  if (tandem.commonalities && tandem.commonalities.length > 0) {
    // Calculate column widths
    const colWidths = {
      question: Math.max(10, ...tandem.commonalities.map(c => c.question.length)),
      answer1: Math.max(name1.length, ...tandem.commonalities.map(c => (c.answer1 || '-').length)),
      answer2: Math.max(name2.length, ...tandem.commonalities.map(c => (c.answer2 || '-').length)),
    };

    // Cap widths
    colWidths.question = Math.min(colWidths.question, 30);
    colWidths.answer1 = Math.min(colWidths.answer1, 25);
    colWidths.answer2 = Math.min(colWidths.answer2, 25);

    // Header
    text += padRight('Frage', colWidths.question) + ' | ';
    text += padRight(name1, colWidths.answer1) + ' | ';
    text += padRight(name2, colWidths.answer2) + ' | ';
    text += 'Gemeinsamkeit\n';

    // Separator
    text += '-'.repeat(colWidths.question) + '-+-';
    text += '-'.repeat(colWidths.answer1) + '-+-';
    text += '-'.repeat(colWidths.answer2) + '-+-';
    text += '-'.repeat(20) + '\n';

    // Data rows
    for (const c of tandem.commonalities) {
      text += padRight(truncateText(c.question, colWidths.question), colWidths.question) + ' | ';
      text += padRight(truncateText(c.answer1 || '-', colWidths.answer1), colWidths.answer1) + ' | ';
      text += padRight(truncateText(c.answer2 || '-', colWidths.answer2), colWidths.answer2) + ' | ';
      text += (c.commonality || '') + '\n';
    }
  }

  text += '\nIch freue mich über eure Rückmeldung!\n';

  navigator.clipboard.writeText(text).then(() => {
    showSuccessMessageInList('Text kopiert!');
  }).catch(() => {
    alert('Fehler beim Kopieren');
  });
}

function padRight(str: string, len: number): string {
  if (str.length >= len) return str.substring(0, len);
  return str + ' '.repeat(len - str.length);
}

function truncateText(str: string, maxLen: number): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 2) + '..';
}

function extractFirstName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') return 'Partner*in';

  const bracketMatch = fullName.match(/\(([^)]+)\)/);
  if (bracketMatch) {
    const nameInBrackets = bracketMatch[1].trim();
    const firstName = nameInBrackets.split(/[\s,]+/)[0];
    if (firstName && firstName.length > 1 && !/^(locals?|einwander|interview|gespräch)/i.test(firstName)) {
      return firstName;
    }
  }

  if (!/^(aufnahmegespräch|interview|gespräch)/i.test(fullName)) {
    const firstName = fullName.split(/[\s,]+/)[0];
    if (firstName && firstName.length > 1) {
      return firstName;
    }
  }

  return 'Partner*in';
}

function showSuccessMessageInList(message: string): void {
  let toast = document.getElementById('successToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'successToast';
    toast.className = 'success-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast?.classList.remove('visible'), 2000);
}

function renderTandemCard(tandem: Tandem): string {
  const date = new Date(tandem.created).toLocaleDateString('de-DE');
  const stars = renderStars(tandem.matchScore);

  return `
    <div class="tandem-card" data-tandem-id="${tandem.id}">
      <div class="header">
        <div class="title">${escapeHtml(tandem.name)}</div>
        <div class="meta">
          <span class="stars">${stars}</span>
          <span class="date">${date}</span>
          <button class="copy-tandem btn-icon" data-tandem-id="${tandem.id}" title="Text kopieren">📋</button>
          <button class="delete-tandem close-btn" data-tandem-id="${tandem.id}">&times;</button>
        </div>
      </div>
      <div class="profiles">
        <div class="profile">
          <strong>${escapeHtml(tandem.profile1.name)}</strong>
        </div>
        <div class="profile">
          <strong>${escapeHtml(tandem.profile2.name)}</strong>
        </div>
      </div>
      ${tandem.suggestionText ? `
        <div class="suggestion-text">
          <strong>Vorschlagstext:</strong>
          <pre>${escapeHtml(tandem.suggestionText)}</pre>
        </div>
      ` : tandem.commonalities.length > 0 ? `
        <div class="commonalities">
          <strong>Gemeinsamkeiten:</strong>
          ${tandem.commonalities.slice(0, 3).map(c => `
            <div class="commonality">• ${escapeHtml(c.commonality)}</div>
          `).join('')}
          ${tandem.commonalities.length > 3 ? `<div class="commonality">... und ${tandem.commonalities.length - 3} weitere</div>` : ''}
        </div>
      ` : ''}
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

let pendingMatch: { profile1: Profile; profile2: Profile } | null = null;

function showMatchModal(profile1: Profile, profile2: Profile): void {
  const modal = document.getElementById('matchModal');
  const previewContainer = document.getElementById('matchPreview');

  if (!modal || !previewContainer) return;

  pendingMatch = { profile1, profile2 };

  const matchResult = calculateMatchResult(profile1, profile2);

  previewContainer.innerHTML = `
    <div class="match-preview-content">
      <div class="match-profiles">
        <div class="profile">
          <strong>${escapeHtml(profile1.name)}</strong>
        </div>
        <div class="match-icon">🤝</div>
        <div class="profile">
          <strong>${escapeHtml(profile2.name)}</strong>
        </div>
      </div>
      <div class="match-score">
        <span>Match-Qualität: </span>
        <span class="stars">${renderStars(matchResult.score)}</span>
      </div>
      <div id="tandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    </div>
  `;

  // Initialize the interactive editor
  const editorContainer = document.getElementById('tandemEditorContainer');
  if (editorContainer) {
    initTandemEditor(editorContainer, profile1, profile2);
  }

  modal.classList.add('visible');
}

function hideMatchModal(): void {
  const modal = document.getElementById('matchModal');
  modal?.classList.remove('visible');
  pendingMatch = null;
}

function confirmMatchCreation(): void {
  if (!pendingMatch) return;

  const { profile1, profile2 } = pendingMatch;
  const matchResult = calculateMatchResult(profile1, profile2);

  // Get content from the interactive editor
  const suggestionText = getEditorContent();
  const commonalities = getEditorCommonalities();

  const tandem: Tandem = {
    id: crypto.randomUUID(),
    profile1,
    profile2,
    name: `${profile1.name} & ${profile2.name}`,
    created: new Date().toISOString(),
    commonalities,
    matchScore: matchResult.score,
    suggestionText,
  };

  addTandem(tandem);
  hideMatchModal();

  // Show success message but stay on matching tab for more matches
  showSuccessMessage(`Tandem erstellt: ${profile1.name} & ${profile2.name}`);

  // Keep the selected profile for further matching (don't deselect)
}

function showSuccessMessage(message: string): void {
  // Create or update success toast
  let toast = document.getElementById('successToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'successToast';
    toast.className = 'success-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast?.classList.remove('visible'), 3000);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================
// EDIT TANDEM MODAL (for already matched profiles)
// ==========================================

let editingTandem: Tandem | null = null;

function showEditTandemModal(tandem: Tandem): void {
  editingTandem = tandem;

  // Create modal if it doesn't exist
  let modal = document.getElementById('editTandemModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editTandemModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Tandem bearbeiten</h2>
          <button class="close-btn" id="closeEditModal">&times;</button>
        </div>
        <div class="modal-body" id="editTandemContent">
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" id="dissolveTandem">🗑️ Tandem auflösen</button>
          <button class="btn btn-outline" id="cancelEditTandem">Abbrechen</button>
          <button class="btn btn-primary" id="saveEditTandem">💾 Speichern</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('#closeEditModal')?.addEventListener('click', hideEditTandemModal);
    modal.querySelector('#cancelEditTandem')?.addEventListener('click', hideEditTandemModal);
    modal.querySelector('#dissolveTandem')?.addEventListener('click', dissolveTandem);
    modal.querySelector('#saveEditTandem')?.addEventListener('click', saveEditTandem);
  }

  // Populate content
  const content = document.getElementById('editTandemContent');
  if (content) {
    const date = new Date(tandem.created).toLocaleDateString('de-DE');
    content.innerHTML = `
      <div class="edit-tandem-info">
        <div class="tandem-pair">
          <div class="profile-name">
            <strong>${escapeHtml(tandem.profile1.name)}</strong>
          </div>
          <div class="pair-icon">🤝</div>
          <div class="profile-name">
            <strong>${escapeHtml(tandem.profile2.name)}</strong>
          </div>
        </div>
        <div class="tandem-meta">
          <span class="stars">${renderStars(tandem.matchScore)}</span>
          <span class="date">Erstellt am: ${date}</span>
        </div>
      </div>
      <div id="editTandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    `;

    // Initialize the editor with existing tandem data
    const editorContainer = document.getElementById('editTandemEditorContainer');
    if (editorContainer) {
      initTandemEditor(editorContainer, tandem.profile1, tandem.profile2);
    }
  }

  modal.classList.add('visible');
}

function hideEditTandemModal(): void {
  const modal = document.getElementById('editTandemModal');
  modal?.classList.remove('visible');
  editingTandem = null;
}

function dissolveTandem(): void {
  if (!editingTandem) return;

  const confirmMsg = `Tandem zwischen "${editingTandem.profile1.name}" und "${editingTandem.profile2.name}" wirklich auflösen?\n\nDie Profile können dann erneut gematcht werden.`;
  if (confirm(confirmMsg)) {
    deleteTandem(editingTandem.id);
    hideEditTandemModal();
    showSuccessMessage('Tandem aufgelöst - Profile können neu gematcht werden');
  }
}

function saveEditTandem(): void {
  if (!editingTandem) return;

  // Get updated content from editor
  const suggestionText = getEditorContent();
  const commonalities = getEditorCommonalities();

  // Update the tandem
  updateTandem(editingTandem.id, {
    suggestionText,
    commonalities,
  });

  hideEditTandemModal();
  showSuccessMessage('Tandem aktualisiert');
}
