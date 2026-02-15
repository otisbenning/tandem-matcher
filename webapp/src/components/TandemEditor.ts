// TandemEditor Component - Interactive table editor for tandem matching
import type { Profile, Commonality, ProfileField } from '@shared/types';
import { getCoordinatesForPLZ, calculateTravelTimes, formatTravelTimes, generateMapsLinks } from '../services/geocoding';
import { isOllamaAvailable, generateCommonality, generateAllCommonalities, getOllamaStatus, buildPrompt } from '../services/ollama';

interface EditableRow {
  id: string;
  question: string;
  answer1: string;
  answer2: string;
  comment: string;
  selected: boolean;  // For merge selection
  included: boolean;  // Whether to include in email
  collapsed: boolean; // Whether details are collapsed
  hidden?: boolean;   // Whether row was merged into another
  mergedWith?: string[];
  category: string;
}

let rows: EditableRow[] = [];
let profile1Name = '';
let profile2Name = '';
let selectedRows: Set<string> = new Set();

// Default AI prompt template (like original app)
const DEFAULT_AI_PROMPT = 'Schreibe hierzu einen kurzen Text. Die Frage zu den Antworten lautet {Frage}. Schreibe, wie die Antworten zusammenpassen könnten bzw. gebe Beispiele aus. Hier die Antworten: Person 1 - {Antwort1}, Person 2 - {Antwort2}. Schreibe den Text nach diesem Beispiel: "Ihr habt beide angegeben, dass ihr gerne kocht - ob mit Freund*innen oder alleine. Also los! Probiert doch einmal gemeinsam neue Rezepte. Außerdem geht ihr beide gerne Spazieren. Nach dem Essen sollst du Ruhn, oder 1.000 Schritte tun. Also habt ihr ja quasi schon einen Tagesplan ;) Weil ihr beide gerne auch kulturelle Dinge macht, wie in das Theater/Museum/oder auf andere Kulturveranstaltungen geht - schaut doch mal auf rausgegangen.de was es in Köln so die nächsten Tage gibt. Oder guckt bei uns im Eventportal: www.startwithafriend.de/events" - Nenne KEINE Namen oder andere Personenbezeichnungen.';

// Field categories like in original app
const CATEGORY_ORDER = [
  'Person',
  'Sprachen & Herkunft',
  'Beruf & Bildung',
  'Hobbys & Interessen',
  'Tandem-Wünsche',
  'Verfügbarkeit',
  'Sonstiges'
];

// Questions to exclude completely (admin fields)
const EXCLUDED_QUESTIONS = [
  // Original exclusions
  'vermittler', 'durchgeführt von', 'status', 'terminart',
  'anmeldestatus', 'bearbeitungsstatus', 'infoabend', 'infonachmittag',
  'aufnahmegespräch datum', 'newsletter', 'dsgvo', 'einverständnis',
  'notizen', 'interne notizen', 'bemerkungen admin', 'url', 'link',
  'wie wirkt die person', 'eindruck', 'einschätzung', 'bewertung',
  'nächste schritte', 'follow-up', 'user-id', 'profil-id', 'teilnehmer-id',

  // Additional admin fields (user request)
  'women_kpi', 'kpi',
  'integrationskurs', 'besuchst du gerade einen integrationskurs',
  'vorgeschlagene termine', 'suggested_appointments',
  'telefonnummer', 'phone_number', 'telefon',
  'responsible_user', 'responsible',
  'registration_interview', 'appointment_type', 'appointment_info',
  'region', 'department_region', 'department',
  'process_history', 'process_current_step',
  'flucht', 'einwandungserfahrung', 'immigration_experience',
  'create_uid', 'existing_tandem_count', 'tandem_count',

  // Personal data not needed for matching
  'birthday', 'geburtstag', 'geburtsdatum',
  'group', 'gruppe',
  'e-mail', 'email', 'e-mail-adresse', 'emailadresse',
  'nachname', 'last_name', 'lastname', 'familienname',
  'full_name', 'fullname', 'vollständiger name',

  // Event registration times (not relevant for matching)
  'datum/uhrzeit', 'datum uhrzeit', 'anmeldedatum', 'registrierungsdatum'
];

// Additional exclusions - exact field name matches
const EXCLUDED_EXACT_FIELDS = ['name', 'full name'];

function categorizeQuestion(question: string): string {
  const q = question.toLowerCase();

  // Person - basic info
  if (q.includes('name') || q.includes('alter') || q.includes('geschlecht') ||
      q.includes('geboren') || q.includes('plz') || q.includes('postleitzahl')) {
    return 'Person';
  }

  // Languages & Origin
  if (q.includes('sprache') || q.includes('herkunft') || q.includes('land') ||
      q.includes('deutschland') || q.includes('seit wann')) {
    return 'Sprachen & Herkunft';
  }

  // Work & Education - including future plans and past experience
  if (q.includes('beruf') || q.includes('arbeit') || q.includes('studium') ||
      q.includes('studiert') || q.includes('abschluss') || q.includes('branche') ||
      q.includes('was machst du gerade') ||
      q.includes('was hast du vorher gemacht') || q.includes('was hast du gelernt') ||
      q.includes('in zukunft') || q.includes('zukunft gerne machen')) {
    return 'Beruf & Bildung';
  }

  // Hobbies & Interests - including events and community activities
  if (q.includes('hobby') || q.includes('freizeit') || q.includes('interesse') ||
      q.includes('ausprobieren') || q.includes('was machst du gerne') ||
      q.includes('freundschaft') || q.includes('wichtig') ||
      q.includes('event') || q.includes('anbieten') || q.includes('themen') ||
      q.includes('community') || q.includes('unternehmen')) {
    return 'Hobbys & Interessen';
  }

  // Tandem preferences
  if (q.includes('tandem') || q.includes('swaf') || q.includes('mitmachen') ||
      q.includes('warum') || q.includes('vorstellung') ||
      (q.includes('geschlecht') && q.includes('partner'))) {
    return 'Tandem-Wünsche';
  }

  // Availability
  if (q.includes('zeit') || q.includes('treffen') || q.includes('wann') ||
      q.includes('erreichen') || q.includes('kontakt') || q.includes('bewegst')) {
    return 'Verfügbarkeit';
  }

  return 'Sonstiges';
}

function shouldExcludeQuestion(question: string): boolean {
  const q = question.toLowerCase().trim();

  // Check exact matches first (e.g., field named exactly "name")
  if (EXCLUDED_EXACT_FIELDS.includes(q)) {
    return true;
  }

  // Check partial matches
  return EXCLUDED_QUESTIONS.some(ex => q.includes(ex));
}

function isEmptyAnswer(ans: string): boolean {
  if (!ans) return true;
  const empty = ['übersprungen', 'keine angabe', 'k.a.', 'n/a', '-', '', 'egal', 'keine', 'null', 'undefined'];
  return empty.includes(ans.toLowerCase().trim());
}

// Fields that don't need AI generation (simple facts, already processed elsewhere)
const SKIP_AI_GENERATION_PATTERNS = [
  // Names
  'name', 'vorname', 'nachname',
  // Location (handled by distance calculation)
  'plz', 'postleitzahl', 'standort', 'ort', 'adresse', 'wohnort',
  // Simple demographics
  'geschlecht', 'gender', 'alter', 'age', 'geburt',
  // Origin (simple fact)
  'in deutschland geboren', 'in welchem land', 'herkunftsland', 'geburtsland',
  'woher kommst du', 'country',
  // Preferences (handled by matching algorithm)
  'altersunterschied', 'geschlechterpräferenz', 'alterspräferenz',
];

function shouldSkipAIGeneration(question: string): boolean {
  const q = question.toLowerCase();
  return SKIP_AI_GENERATION_PATTERNS.some(pattern => q.includes(pattern));
}

export function initTandemEditor(
  container: HTMLElement,
  p1: Profile,
  p2: Profile
): void {
  // Clear AI suggestions cache for fresh suggestions per tandem
  localStorage.removeItem('swaf_ai_suggestions_cache');

  profile1Name = extractFirstName(p1.name);
  profile2Name = extractFirstName(p2.name);

  // Use normalized question as key to auto-merge synonyms
  // Map: normalizedQuestion -> { displayQuestion, answer1, answer2 }
  const questionMap = new Map<string, {
    displayQuestion: string;
    answer1: string;
    answer2: string;
    mergedQuestions: string[];
  }>();

  // Helper to add/merge a field
  function addField(question: string, answer: string, isProfile1: boolean): void {
    if (shouldExcludeQuestion(question)) return;
    if (!answer || isEmptyAnswer(answer)) return;

    const normalized = normalizeQuestion(question);
    const existing = questionMap.get(normalized);

    if (existing) {
      // Merge into existing entry
      if (isProfile1) {
        if (!existing.answer1) {
          existing.answer1 = answer;
        } else if (existing.answer1 !== answer) {
          // Same profile, different answer for similar question - append
          existing.answer1 += '; ' + answer;
        }
      } else {
        if (!existing.answer2) {
          existing.answer2 = answer;
        } else if (existing.answer2 !== answer) {
          existing.answer2 += '; ' + answer;
        }
      }
      // Track merged questions
      if (!existing.mergedQuestions.includes(question)) {
        existing.mergedQuestions.push(question);
      }
    } else {
      // New entry
      questionMap.set(normalized, {
        displayQuestion: question,
        answer1: isProfile1 ? answer : '',
        answer2: isProfile1 ? '' : answer,
        mergedQuestions: [question]
      });
    }
  }

  // Process all fields from both profiles
  for (const field of p1.fields) {
    addField(field.question, field.answer || '', true);
  }
  for (const field of p2.fields) {
    addField(field.question, field.answer || '', false);
  }

  // Convert to editable rows with smart text suggestions
  rows = [];
  let index = 0;
  for (const [normalizedKey, data] of questionMap) {
    // Skip rows where both answers are empty
    if (!data.answer1 && !data.answer2) continue;

    // Use canonical display name for merged fields (hides original questions)
    const displayQuestion = getDisplayName(normalizedKey, data.displayQuestion);

    const smartText = generateSmartText(displayQuestion, data.answer1, data.answer2);
    // Auto-include rows that have smart text suggestions or both answers
    const hasContent = smartText.length > 0 || (data.answer1 && data.answer2);

    rows.push({
      id: `row-${index}`,
      question: displayQuestion,
      answer1: data.answer1,
      answer2: data.answer2,
      comment: smartText,
      selected: false,
      included: hasContent,
      collapsed: !hasContent,
      category: categorizeQuestion(displayQuestion),
      // Don't show mergedWith anymore - the original questions are hidden
    });
    index++;
  }

  // Sort by category, then by whether it has content (content first)
  rows.sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(a.category);
    const catB = CATEGORY_ORDER.indexOf(b.category);
    if (catA !== catB) return catA - catB;
    // Within category, show included rows first
    if (a.included !== b.included) return a.included ? -1 : 1;
    return a.question.localeCompare(b.question);
  });

  selectedRows.clear();
  renderEditor(container);

  // Trigger async PLZ distance calculation
  for (const row of rows) {
    if (row.question.toLowerCase().includes('plz') || row.question.toLowerCase().includes('postleitzahl')) {
      if (row.answer1 && row.answer2) {
        analyzePLZAsync(row.answer1, row.answer2, row.id, container);
      }
    }
  }
}

// Question synonyms for auto-merging (same meaning = same field)
// Format: [canonicalKey, ...exactMatches]
// Uses EXACT matching to avoid false positives like "alter" matching "altersunterschied"
const QUESTION_SYNONYMS: Array<{ key: string; patterns: string[] }> = [
  // Age - exact field names only
  { key: 'alter', patterns: ['alter', 'age', 'wie alt bist du', 'wie alt', 'dein alter', 'geburtsjahr'] },
  // Gender - exact field names only
  { key: 'geschlecht', patterns: ['geschlecht', 'gender', 'dein geschlecht', 'welches geschlecht'] },
  // Age preference - separate from age!
  { key: 'altersunterschied', patterns: ['altersunterschied', 'alterspräferenz', 'age_difference', 'max_age_difference', 'maximaler altersunterschied', 'altersunterschied zum tandempartner'] },
  // Gender preference - separate from gender!
  { key: 'geschlechterpräferenz', patterns: ['geschlechterpräferenz', 'gender_preference', 'geschlecht des tandems', 'geschlecht tandempartner', 'welches geschlecht soll', 'gewünschtes geschlecht'] },
  // Name fields
  { key: 'vorname', patterns: ['vorname', 'firstname', 'first_name', 'first name'] },
  // Location
  { key: 'plz', patterns: ['plz', 'postleitzahl', 'postal code', 'zip', 'zipcode', 'deine plz'] },
  // Hobbies
  { key: 'hobbys', patterns: ['hobbys', 'hobbies', 'hobby'] },
  { key: 'freizeit', patterns: ['freizeit', 'freizeitaktivitäten'] },
  { key: 'interessen', patterns: ['interessen', 'interests'] },
  // Languages
  { key: 'sprachen', patterns: ['sprachen', 'languages', 'sprache', 'welche sprachen sprichst du', 'welche sprachen'] },
  // Origin
  { key: 'herkunftsland', patterns: ['herkunftsland', 'herkunft', 'woher kommst du', 'aus welchem land', 'country'] },
  // Time in Germany
  { key: 'seit_wann_deutschland', patterns: ['seit wann in deutschland', 'seit wann bist du in deutschland', 'wie lange in deutschland', 'in deutschland seit'] },
];

// Canonical display names for merged fields
const CANONICAL_DISPLAY_NAMES: Record<string, string> = {
  'vorname': 'Vorname',
  'alter': 'Alter',
  'geschlecht': 'Geschlecht',
  'plz': 'PLZ',
  'hobbys': 'Hobbys',
  'freizeit': 'Freizeitaktivitäten',
  'interessen': 'Interessen',
  'sprachen': 'Sprachen',
  'herkunftsland': 'Herkunftsland',
  'seit_wann_deutschland': 'Seit wann in Deutschland',
  'altersunterschied': 'Maximaler Altersunterschied',
  'geschlechterpräferenz': 'Geschlecht des Tandempartners',
};

function normalizeQuestion(q: string): string {
  const normalized = q.toLowerCase().replace(/[?!.,:*_-]/g, ' ').replace(/\s+/g, ' ').trim();

  // Sort by pattern length (longer patterns first to match "altersunterschied" before "alter")
  const sortedSynonyms = [...QUESTION_SYNONYMS].sort((a, b) => {
    const maxA = Math.max(...a.patterns.map(p => p.length));
    const maxB = Math.max(...b.patterns.map(p => p.length));
    return maxB - maxA;
  });

  // Check for exact pattern matches
  for (const group of sortedSynonyms) {
    for (const pattern of group.patterns) {
      // Check if the normalized question IS the pattern or STARTS/ENDS with it
      if (normalized === pattern ||
          normalized.startsWith(pattern + ' ') ||
          normalized.endsWith(' ' + pattern) ||
          normalized.includes(' ' + pattern + ' ')) {
        return group.key;
      }
    }
  }

  return normalized;
}

function getDisplayName(normalizedKey: string, originalQuestion: string): string {
  // If we have a canonical display name, use it
  if (CANONICAL_DISPLAY_NAMES[normalizedKey]) {
    return CANONICAL_DISPLAY_NAMES[normalizedKey];
  }
  // Otherwise use the original question
  return originalQuestion;
}

function renderEditor(container: HTMLElement): void {
  const selectedCount = selectedRows.size;
  // Filter out hidden rows (merged into other rows)
  const visibleRows = rows.filter(r => !r.hidden);
  const includedCount = visibleRows.filter(r => r.included).length;

  // Group by category (only visible rows)
  const byCategory = new Map<string, EditableRow[]>();
  for (const row of visibleRows) {
    if (!byCategory.has(row.category)) {
      byCategory.set(row.category, []);
    }
    byCategory.get(row.category)!.push(row);
  }

  container.innerHTML = `
    <div class="tandem-editor">
      <div class="editor-toolbar">
        <button class="btn btn-sm" id="mergeRowsBtn" ${selectedCount < 2 ? 'disabled' : ''}>
          Zusammenführen (${selectedCount})
        </button>
        <button class="btn btn-sm btn-outline" id="regenerateBtn" title="Textvorschläge lokal generieren">
          Lokal generieren
        </button>
        <button class="btn btn-sm btn-ai" id="ollamaBtn" title="Mit lokalem LLM (Ollama) generieren" disabled>
          KI generieren...
        </button>
        <span class="toolbar-info">${includedCount} von ${visibleRows.length} Feldern</span>
      </div>

      <div class="editor-table">
        ${CATEGORY_ORDER.map(cat => {
          const catRows = byCategory.get(cat);
          if (!catRows || catRows.length === 0) return '';

          const includedInCat = catRows.filter(r => r.included).length;

          return `
            <div class="category-section">
              <div class="category-header">
                <span>${cat}</span>
                <span class="category-count">${includedInCat}/${catRows.length}</span>
              </div>
              ${catRows.map(row => renderRow(row)).join('')}
            </div>
          `;
        }).join('')}
      </div>

      <div class="editor-preview">
        <div class="preview-header">
          <strong>E-Mail-Vorschau (${includedCount} Felder):</strong>
          <button class="btn btn-sm" id="copyEmailBtn">📋 Kopieren</button>
        </div>
        <div class="preview-content" id="emailPreview">
          ${generateEmailPreview()}
        </div>
      </div>
    </div>
  `;

  attachEventListeners(container);
}

function renderRow(row: EditableRow): string {
  const isSelected = selectedRows.has(row.id);
  const hasComment = row.comment && row.comment.length > 0;

  return `
    <div class="editor-row ${isSelected ? 'selected' : ''} ${row.included ? 'included' : 'excluded'} ${row.collapsed ? 'collapsed' : ''}" data-row-id="${row.id}">
      <div class="row-header">
        <label class="include-toggle" title="In E-Mail einschließen">
          <input type="checkbox" class="include-checkbox" data-row-id="${row.id}" ${row.included ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
        <div class="row-question" data-row-id="${row.id}">
          <span class="collapse-icon">${row.collapsed ? '▸' : '▾'}</span>
          <span class="question-text">${escapeHtml(row.question)}</span>
          ${hasComment ? '<span class="has-comment-indicator">✓</span>' : ''}
        </div>
        <div class="row-quick-actions">
          <input type="checkbox" class="merge-checkbox" data-row-id="${row.id}" ${isSelected ? 'checked' : ''} title="Für Zusammenführen auswählen">
        </div>
      </div>

      <div class="row-details ${row.collapsed ? 'hidden' : ''}">
        <div class="row-answers">
          <div class="answer-cell">
            <div class="answer-label">${escapeHtml(profile1Name)}:</div>
            <textarea
              class="answer-input answer1-input"
              data-row-id="${row.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${escapeHtml(row.answer1)}</textarea>
          </div>
          <div class="answer-cell">
            <div class="answer-label">${escapeHtml(profile2Name)}:</div>
            <textarea
              class="answer-input answer2-input"
              data-row-id="${row.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${escapeHtml(row.answer2)}</textarea>
          </div>
        </div>

        <div class="row-comment">
          <textarea
            class="comment-input"
            data-row-id="${row.id}"
            placeholder="Gemeinsamkeit / Kommentar eingeben..."
            rows="2"
          >${escapeHtml(stripMapLink(row.comment))}</textarea>
          ${renderMapLinkButton(row.comment)}
          <div class="comment-buttons">
            <button class="btn-icon smart-suggest" data-row-id="${row.id}" title="Lokaler Textvorschlag">💡</button>
            <button class="btn-icon ai-assist" data-row-id="${row.id}" title="KI-Unterstützung (ChatGPT/Claude)">🤖</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachEventListeners(container: HTMLElement): void {
  // Include/exclude checkbox
  container.querySelectorAll('.include-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      const target = e.target as HTMLInputElement;
      const rowId = target.dataset.rowId;
      if (!rowId) return;

      const row = rows.find(r => r.id === rowId);
      if (row) {
        row.included = target.checked;
        updatePreview(container);
        // Update the row's visual state without full re-render
        const rowEl = container.querySelector(`.editor-row[data-row-id="${rowId}"]`);
        if (rowEl) {
          rowEl.classList.toggle('included', row.included);
          rowEl.classList.toggle('excluded', !row.included);
        }
      }
    });
  });

  // Merge selection checkbox
  container.querySelectorAll('.merge-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      const target = e.target as HTMLInputElement;
      const rowId = target.dataset.rowId;
      if (!rowId) return;

      if (target.checked) {
        selectedRows.add(rowId);
      } else {
        selectedRows.delete(rowId);
      }
      // Update merge button state
      const mergeBtn = container.querySelector('#mergeRowsBtn') as HTMLButtonElement;
      if (mergeBtn) {
        mergeBtn.disabled = selectedRows.size < 2;
        mergeBtn.textContent = `⊕ Zusammenführen (${selectedRows.size})`;
      }
    });
  });

  // Collapse/expand on question click
  container.querySelectorAll('.row-question').forEach(questionEl => {
    questionEl.addEventListener('click', (e) => {
      const rowId = (questionEl as HTMLElement).dataset.rowId;
      if (!rowId) return;

      const row = rows.find(r => r.id === rowId);
      if (row) {
        row.collapsed = !row.collapsed;
        const rowEl = container.querySelector(`.editor-row[data-row-id="${rowId}"]`);
        if (rowEl) {
          rowEl.classList.toggle('collapsed', row.collapsed);
          const details = rowEl.querySelector('.row-details');
          const icon = rowEl.querySelector('.collapse-icon');
          if (details) details.classList.toggle('hidden', row.collapsed);
          if (icon) icon.textContent = row.collapsed ? '▸' : '▾';
        }
      }
    });
  });

  // Auto-resize textareas (for browsers without field-sizing: content)
  function autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  // Answer 1 input (editable)
  container.querySelectorAll('.answer1-input').forEach(textarea => {
    const ta = textarea as HTMLTextAreaElement;
    autoResize(ta); // Initial resize
    ta.addEventListener('input', (e) => {
      const target = e.target as HTMLTextAreaElement;
      autoResize(target);
      const rowId = target.dataset.rowId;
      if (!rowId) return;

      const row = rows.find(r => r.id === rowId);
      if (row) {
        row.answer1 = target.value;
        updatePreview(container);
      }
    });
  });

  // Answer 2 input (editable)
  container.querySelectorAll('.answer2-input').forEach(textarea => {
    const ta = textarea as HTMLTextAreaElement;
    autoResize(ta); // Initial resize
    ta.addEventListener('input', (e) => {
      const target = e.target as HTMLTextAreaElement;
      autoResize(target);
      const rowId = target.dataset.rowId;
      if (!rowId) return;

      const row = rows.find(r => r.id === rowId);
      if (row) {
        row.answer2 = target.value;
        updatePreview(container);
      }
    });
  });

  // Comment input auto-resize
  container.querySelectorAll('.comment-input').forEach(textarea => {
    const ta = textarea as HTMLTextAreaElement;
    autoResize(ta);
  });

  // Comment input
  container.querySelectorAll('.comment-input').forEach(textarea => {
    textarea.addEventListener('input', (e) => {
      const target = e.target as HTMLTextAreaElement;
      const rowId = target.dataset.rowId;
      if (!rowId) return;

      const row = rows.find(r => r.id === rowId);
      if (row) {
        row.comment = target.value;
        // Auto-include if user types something
        if (target.value.length > 0 && !row.included) {
          row.included = true;
          const checkbox = container.querySelector(`.include-checkbox[data-row-id="${rowId}"]`) as HTMLInputElement;
          if (checkbox) checkbox.checked = true;
        }
        updatePreview(container);
      }
    });
  });

  // Smart suggest button (local) - with Ollama fallback on long-press/double-click
  container.querySelectorAll('.smart-suggest').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const rowId = (btn as HTMLElement).dataset.rowId;
      if (!rowId) return;

      const row = rows.find(r => r.id === rowId);
      if (!row) return;

      // First try local generation
      row.comment = generateSmartText(row.question, row.answer1, row.answer2);
      const textarea = container.querySelector(`.comment-input[data-row-id="${rowId}"]`) as HTMLTextAreaElement;
      if (textarea) textarea.value = row.comment;
      updatePreview(container);

      // If local didn't produce good result and Ollama is available, try AI
      if ((!row.comment || row.comment.length < 10) && row.answer1 && row.answer2) {
        const available = await isOllamaAvailable();
        if (available) {
          (btn as HTMLElement).textContent = '...';
          const aiResult = await generateCommonality(row.question, row.answer1, row.answer2);
          if (aiResult) {
            row.comment = aiResult;
            row.included = true;
            if (textarea) textarea.value = row.comment;
            updatePreview(container);
          }
          (btn as HTMLElement).textContent = '💡';
        }
      }
    });
  });

  // AI assist button (ChatGPT/Claude)
  container.querySelectorAll('.ai-assist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rowId = (btn as HTMLElement).dataset.rowId;
      if (!rowId) return;

      const row = rows.find(r => r.id === rowId);
      if (row) {
        showAIAssistModal(row, container);
      }
    });
  });

  // Merge rows button
  container.querySelector('#mergeRowsBtn')?.addEventListener('click', () => {
    mergeSelectedRows();
    renderEditor(container);
  });

  // Regenerate all (local)
  container.querySelector('#regenerateBtn')?.addEventListener('click', () => {
    for (const row of rows) {
      row.comment = generateSmartText(row.question, row.answer1, row.answer2);
      row.included = row.comment.length > 0;
    }
    renderEditor(container);
  });

  // Ollama AI generation
  const ollamaBtn = container.querySelector('#ollamaBtn') as HTMLButtonElement;
  getOllamaStatus().then(status => {
    if (status.available) {
      ollamaBtn.disabled = false;
      ollamaBtn.textContent = 'KI generieren';
      ollamaBtn.title = 'Mit Mistral KI generieren';
    } else {
      ollamaBtn.textContent = 'KI nicht verfügbar';
      ollamaBtn.title = 'KI-Server nicht erreichbar';
    }
  }).catch(() => {
    ollamaBtn.textContent = 'KI nicht verfügbar';
    ollamaBtn.title = 'Fehler bei der Verbindung zum KI-Server';
  });

  ollamaBtn?.addEventListener('click', async () => {
    ollamaBtn.disabled = true;
    ollamaBtn.textContent = 'KI läuft...';

    // Filter: only included fields with both answers, skip simple facts
    const fieldsToGenerate = rows
      .filter(r => r.included && r.answer1 && r.answer2 && !shouldSkipAIGeneration(r.question))
      .map(r => ({ question: r.question, answer1: r.answer1, answer2: r.answer2, rowId: r.id }));

    // Show live preview modal immediately
    showLiveAIPreviewModal(fieldsToGenerate, container, () => {
      ollamaBtn.disabled = false;
      ollamaBtn.textContent = 'KI generieren';
    });
  });

  // Copy email (with HTML table for Word compatibility)
  container.querySelector('#copyEmailBtn')?.addEventListener('click', () => {
    const textVersion = getEditorContent();
    const htmlVersion = getEditorContentHTML();

    // Use ClipboardItem API for both HTML and text (Word-compatible)
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const clipboardItems = [
        new ClipboardItem({
          'text/html': new Blob([htmlVersion], { type: 'text/html' }),
          'text/plain': new Blob([textVersion], { type: 'text/plain' })
        })
      ];

      navigator.clipboard.write(clipboardItems).then(() => {
        const btn = container.querySelector('#copyEmailBtn') as HTMLButtonElement;
        if (btn) {
          btn.textContent = '✓ Kopiert (Word-kompatibel)!';
          setTimeout(() => btn.textContent = '📋 Kopieren', 2000);
        }
      }).catch(() => {
        // Fallback to text only
        navigator.clipboard.writeText(textVersion);
      });
    } else {
      // Fallback for older browsers
      navigator.clipboard.writeText(textVersion).then(() => {
        const btn = container.querySelector('#copyEmailBtn') as HTMLButtonElement;
        if (btn) {
          btn.textContent = '✓ Kopiert!';
          setTimeout(() => btn.textContent = '📋 Kopieren', 2000);
        }
      });
    }
  });
}

function mergeSelectedRows(): void {
  if (selectedRows.size < 2) return;

  const selectedIds = Array.from(selectedRows);
  const targetId = selectedIds[0];
  const targetRow = rows.find(r => r.id === targetId);
  if (!targetRow) return;

  const mergeIds = selectedIds.slice(1);
  for (const mergeId of mergeIds) {
    const mergeRow = rows.find(r => r.id === mergeId);
    if (!mergeRow) continue;

    // Combine questions
    targetRow.question += ' + ' + mergeRow.question;

    // Combine answers
    if (mergeRow.answer1 && mergeRow.answer1 !== targetRow.answer1) {
      targetRow.answer1 = targetRow.answer1 ? targetRow.answer1 + '; ' + mergeRow.answer1 : mergeRow.answer1;
    }
    if (mergeRow.answer2 && mergeRow.answer2 !== targetRow.answer2) {
      targetRow.answer2 = targetRow.answer2 ? targetRow.answer2 + '; ' + mergeRow.answer2 : mergeRow.answer2;
    }

    // Combine comments
    if (mergeRow.comment) {
      targetRow.comment = targetRow.comment ? targetRow.comment + '; ' + mergeRow.comment : mergeRow.comment;
    }

    // Exclude merged rows from email but keep visible (user can toggle back)
    mergeRow.included = false;

    if (!targetRow.mergedWith) targetRow.mergedWith = [];
    targetRow.mergedWith.push(mergeRow.question.substring(0, 30));
  }

  // Regenerate smart text for combined row
  targetRow.comment = generateSmartText(targetRow.question, targetRow.answer1, targetRow.answer2);

  selectedRows.clear();
}

// ==========================================
// SMART TEXT GENERATION (like original app)
// ==========================================
function generateSmartText(question: string, answer1: string, answer2: string): string {
  const q = question.toLowerCase();
  const a1 = (answer1 || '').toLowerCase().trim();
  const a2 = (answer2 || '').toLowerCase().trim();

  // Skip empty answers
  if (!a1 && !a2) return '';
  if (isEmptyAnswer(a1) && isEmptyAnswer(a2)) return '';

  // Exact match
  if (a1 === a2 && a1.length > 2) {
    if (q.includes('wichtig') || q.includes('freundschaft')) {
      return `Gemeinsamer Wert: ${answer1}`;
    }
    if (q.includes('studium') && a1.includes('ja')) {
      return 'Beide haben studiert - das verbindet!';
    }
    return `Übereinstimmung: ${answer1}`;
  }

  // Age analysis
  if (q.includes('alter') && !q.includes('unterschied')) {
    const age1 = parseInt(a1);
    const age2 = parseInt(a2);
    if (!isNaN(age1) && !isNaN(age2)) {
      const diff = Math.abs(age1 - age2);
      if (diff === 0) return 'Genau gleich alt!';
      if (diff <= 3) return `Nur ${diff} Jahre Unterschied - perfekt!`;
      if (diff <= 7) return `${diff} Jahre Unterschied - passt gut`;
      if (diff <= 15) return `${diff} Jahre Unterschied - verschiedene Perspektiven`;
      return `${diff} Jahre Unterschied`;
    }
  }

  // Languages
  if (q.includes('sprache') || q.includes('sprichst')) {
    return analyzeLanguages(answer1, answer2);
  }

  // Hobbies/Interests/Events
  if (q.includes('hobby') || q.includes('freizeit') || q.includes('interesse') ||
      q.includes('ausprobieren') || q.includes('was machst du gerne') ||
      q.includes('event') || q.includes('anbieten') || q.includes('unternehmen') ||
      q.includes('themen')) {
    return analyzeHobbies(answer1, answer2);
  }

  // Work/Education/Future
  if (q.includes('beruf') || q.includes('arbeit') || q.includes('studium') ||
      q.includes('gelernt') || q.includes('zukunft') || q.includes('branche') ||
      q.includes('was machst du gerade') || q.includes('vorher gemacht')) {
    return analyzeWork(answer1, answer2);
  }

  // Time availability
  if (q.includes('zeit') || q.includes('treffen') || q.includes('wann') ||
      q.includes('erreichbar')) {
    return analyzeTime(answer1, answer2);
  }

  // Friendship values
  if (q.includes('wichtig') || q.includes('freundschaft') || q.includes('erwartung')) {
    return analyzeValues(answer1, answer2);
  }

  // PLZ/Location
  if (q.includes('plz') || q.includes('postleitzahl')) {
    return analyzePLZ(answer1, answer2);
  }

  // Origin/Country
  if (q.includes('herkunft') || q.includes('land') || q.includes('woher')) {
    return analyzeOrigin(answer1, answer2);
  }

  // Tandem motivation
  if (q.includes('tandem') || q.includes('warum') || q.includes('mitmachen') ||
      q.includes('swaf') || q.includes('start with a friend')) {
    return analyzeTandemMotivation(answer1, answer2);
  }

  // Gender/Same gender preference check
  if (q.includes('geschlecht') && (q.includes('partner') || q.includes('tandem'))) {
    return analyzeGenderPreference(answer1, answer2);
  }

  // Generic similarity check - always try to find something
  return analyzeGeneric(answer1, answer2);
}

function analyzeLanguages(a1: string, a2: string): string {
  const langs1 = a1.toLowerCase().split(/[,;]/).map(s => s.trim()).filter(s => s.length > 2);
  const langs2 = a2.toLowerCase().split(/[,;]/).map(s => s.trim()).filter(s => s.length > 2);

  const common = langs1.filter(l1 => langs2.some(l2 =>
    l1.includes(l2) || l2.includes(l1)
  ));

  if (common.length > 0) {
    return `Gemeinsame Sprachen: ${[...new Set(common)].join(', ')}`;
  }
  return '';
}

function analyzeHobbies(a1: string, a2: string): string {
  const hobbies1 = a1.toLowerCase().split(/[,;]/).map(s => s.trim()).filter(s => s.length > 2);
  const hobbies2 = a2.toLowerCase().split(/[,;]/).map(s => s.trim()).filter(s => s.length > 2);

  // Find common hobbies with fuzzy matching
  const synonymGroups = [
    ['sport', 'fitness', 'training', 'gym', 'joggen', 'laufen'],
    ['wandern', 'hiking', 'spazieren', 'natur', 'wald'],
    ['kochen', 'backen', 'essen', 'kulinarisch', 'rezept'],
    ['musik', 'konzert', 'instrument', 'singen'],
    ['lesen', 'bücher', 'literatur'],
    ['reisen', 'urlaub', 'travel', 'länder'],
    ['film', 'kino', 'serien', 'netflix', 'movie'],
    ['kunst', 'museum', 'malen', 'zeichnen', 'kreativ'],
    ['tanzen', 'dance', 'salsa', 'bachata', 'tanz'],
    ['fahrrad', 'radfahren', 'cycling', 'bike'],
    ['foto', 'fotografieren', 'photography', 'kamera'],
    ['café', 'kaffee', 'coffee'],
    ['sprache', 'lernen', 'language'],
    ['garten', 'pflanzen', 'garden'],
    ['yoga', 'meditation', 'entspannung'],
    ['schwimmen', 'baden', 'swimming'],
  ];

  const common: string[] = [];

  for (const h1 of hobbies1) {
    for (const h2 of hobbies2) {
      // Direct match
      if (h1.includes(h2) || h2.includes(h1)) {
        common.push(h1.length > h2.length ? h1 : h2);
        continue;
      }

      // Synonym match
      for (const group of synonymGroups) {
        const h1Match = group.some(syn => h1.includes(syn));
        const h2Match = group.some(syn => h2.includes(syn));
        if (h1Match && h2Match) {
          common.push(group[0]);
        }
      }
    }
  }

  const unique = [...new Set(common)];
  if (unique.length > 0) {
    if (unique.length === 1) {
      return `Gemeinsames Hobby: ${unique[0]}`;
    }
    return `Gemeinsame Hobbys: ${unique.slice(0, 4).join(', ')}`;
  }
  return '';
}

function analyzeTime(a1: string, a2: string): string {
  const timeOptions = ['morgens', 'mittags', 'nachmittags', 'abends', 'wochenende', 'unter der woche', 'flexibel'];

  const t1 = a1.toLowerCase();
  const t2 = a2.toLowerCase();

  const common = timeOptions.filter(t => t1.includes(t) && t2.includes(t));

  if (common.includes('flexibel') || common.length >= 2) {
    return `Zeitlich flexibel - passt gut!`;
  }
  if (common.length > 0) {
    return `Gemeinsame Zeit: ${common.join(', ')}`;
  }
  return '';
}

function analyzeValues(a1: string, a2: string): string {
  const values = ['ehrlichkeit', 'vertrauen', 'respekt', 'toleranz', 'humor', 'offenheit', 'zuverlässigkeit', 'kommunikation'];

  const v1 = a1.toLowerCase();
  const v2 = a2.toLowerCase();

  const common = values.filter(v => v1.includes(v) && v2.includes(v));

  if (common.length > 0) {
    return `Gemeinsame Werte: ${common.join(', ')}`;
  }
  return '';
}

function analyzePLZ(a1: string, a2: string): string {
  const plz1 = extractPLZ(a1);
  const plz2 = extractPLZ(a2);

  if (!plz1 || !plz2) return '';

  if (plz1 === plz2) {
    return 'Gleiche PLZ';
  }

  // Return basic text initially, async update will add travel times
  if (plz1.substring(0, 2) === plz2.substring(0, 2)) {
    return 'Gleiche Region - Entfernung wird berechnet...';
  }

  return 'Entfernung wird berechnet...';
}

// Async PLZ analysis with travel times
async function analyzePLZAsync(a1: string, a2: string, rowId: string, container: HTMLElement): Promise<void> {
  const plz1 = extractPLZ(a1);
  const plz2 = extractPLZ(a2);

  if (!plz1 || !plz2) return;

  const row = rows.find(r => r.id === rowId);
  if (!row) return;

  // Calculate travel times
  const times = await calculateTravelTimes(plz1, plz2);

  if (times) {
    // Get coordinates for map links
    const coords1 = await getCoordinatesForPLZ(plz1);
    const coords2 = await getCoordinatesForPLZ(plz2);

    let comment = formatTravelTimes(times);

    // Add map link if we have coordinates
    if (coords1 && coords2) {
      const links = generateMapsLinks(coords1, coords2);
      comment += ` [🗺️](${links.google})`;
    }

    row.comment = comment;
    row.included = true;  // Auto-include PLZ rows with distance info

    // Update the textarea in the DOM (use document.querySelector as container might be stale)
    const textarea = document.querySelector(`.comment-input[data-row-id="${rowId}"]`) as HTMLTextAreaElement;
    if (textarea) {
      // Show text without map link in textarea (map link shown as button)
      textarea.value = stripMapLink(comment);
    }

    // Update include checkbox
    const checkbox = document.querySelector(`.include-checkbox[data-row-id="${rowId}"]`) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = true;
    }

    // Update the preview
    const previewEl = document.querySelector('#emailPreview');
    if (previewEl) {
      previewEl.innerHTML = generateEmailPreview();
    }
  }
}

function extractPLZ(text: string): string | null {
  const match = text.match(/\b(\d{5})\b/);
  return match ? match[1] : null;
}

function analyzeWork(a1: string, a2: string): string {
  const w1 = a1.toLowerCase();
  const w2 = a2.toLowerCase();

  // Work/study status
  const workTerms = [
    ['student', 'studier', 'uni', 'hochschule', 'ausbildung'],
    ['arbeit', 'beruf', 'job', 'angestellt'],
    ['selbstständig', 'freelance', 'freiberuflich'],
    ['suche', 'arbeitslos', 'orientierung'],
    ['it', 'software', 'computer', 'programmier'],
    ['sozial', 'pflege', 'gesundheit', 'medizin'],
    ['lehrer', 'pädagog', 'bildung', 'schule'],
    ['ingenieur', 'technik', 'maschinenbau'],
    ['wirtschaft', 'bwl', 'marketing', 'vertrieb'],
    ['kunst', 'design', 'kreativ', 'musik']
  ];

  const common: string[] = [];
  for (const group of workTerms) {
    const m1 = group.some(t => w1.includes(t));
    const m2 = group.some(t => w2.includes(t));
    if (m1 && m2) {
      common.push(group[0]);
    }
  }

  if (common.length > 0) {
    return `Ähnlicher Bereich: ${common.join(', ')}`;
  }

  // Both studying or both working?
  if ((w1.includes('student') || w1.includes('studier')) &&
      (w2.includes('student') || w2.includes('studier'))) {
    return 'Beide studieren - viel gemeinsam!';
  }

  return analyzeGeneric(a1, a2);
}

function analyzeOrigin(a1: string, a2: string): string {
  const w1 = a1.toLowerCase();
  const w2 = a2.toLowerCase();

  // Same country mentioned
  const countries = ['deutschland', 'syrien', 'iran', 'irak', 'afghanistan', 'türkei', 'ukraine',
                     'eritrea', 'somalia', 'nigeria', 'pakistan', 'indien', 'china', 'russland'];

  for (const country of countries) {
    if (w1.includes(country) && w2.includes(country)) {
      return `Beide haben Bezug zu ${country.charAt(0).toUpperCase() + country.slice(1)}`;
    }
  }

  // Check for general interest in culture
  if ((w1.includes('kultur') || w1.includes('tradition')) &&
      (w2.includes('kultur') || w2.includes('tradition'))) {
    return 'Beide interessiert an Kultur & Traditionen';
  }

  return '';
}

function analyzeTandemMotivation(a1: string, a2: string): string {
  const w1 = a1.toLowerCase();
  const w2 = a2.toLowerCase();

  const motivations = [
    { keywords: ['sprache', 'deutsch', 'lernen', 'verbessern'], text: 'Beide wollen Sprachkenntnisse verbessern' },
    { keywords: ['freund', 'kennenlernen', 'kontakt', 'leute'], text: 'Beide suchen neue Kontakte' },
    { keywords: ['kultur', 'austausch', 'integration'], text: 'Beide wollen kulturellen Austausch' },
    { keywords: ['helfen', 'unterstütz', 'begleiten'], text: 'Gegenseitige Unterstützung ist wichtig' },
    { keywords: ['spaß', 'unternehmung', 'aktivität'], text: 'Beide wollen gemeinsam Spaß haben' }
  ];

  for (const m of motivations) {
    const m1 = m.keywords.some(k => w1.includes(k));
    const m2 = m.keywords.some(k => w2.includes(k));
    if (m1 && m2) {
      return m.text;
    }
  }

  return '';
}

function analyzeGenderPreference(a1: string, a2: string): string {
  const w1 = a1.toLowerCase();
  const w2 = a2.toLowerCase();

  // Check if both are flexible or have matching preferences
  if ((w1.includes('egal') || w1.includes('keine präferenz')) &&
      (w2.includes('egal') || w2.includes('keine präferenz'))) {
    return 'Beide flexibel beim Geschlecht';
  }

  return '';
}

function analyzeGeneric(a1: string, a2: string): string {
  if (!a1 || !a2) return '';

  // Find common meaningful words
  const stopWords = new Set([
    'und', 'oder', 'der', 'die', 'das', 'ein', 'eine', 'mit', 'für', 'von', 'zu',
    'ich', 'mir', 'gerne', 'sehr', 'auch', 'aber', 'wenn', 'dann', 'noch', 'schon',
    'kann', 'will', 'muss', 'soll', 'hat', 'haben', 'sein', 'wird', 'sind', 'ist',
    'nicht', 'mehr', 'viel', 'viele', 'alle', 'diese', 'dies', 'dem', 'den', 'des'
  ]);

  const words1 = a1.toLowerCase()
    .replace(/[.,!?;:()]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  const words2 = a2.toLowerCase()
    .replace(/[.,!?;:()]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const common = words1.filter(w1 =>
    words2.some(w2 => w1 === w2 || (w1.length > 4 && w2.length > 4 && (w1.includes(w2) || w2.includes(w1))))
  );

  const unique = [...new Set(common)];
  if (unique.length >= 1) {
    return `Gemeinsam: ${unique.slice(0, 4).join(', ')}`;
  }

  // If both answers are non-empty but no match found, note that both answered
  if (a1.length > 5 && a2.length > 5) {
    return 'Beide haben geantwortet';
  }

  return '';
}

function updatePreview(container: HTMLElement): void {
  const previewEl = container.querySelector('#emailPreview');
  if (previewEl) {
    previewEl.innerHTML = generateEmailPreview();
  }
}

function generateEmailPreview(): string {
  const includedRows = rows.filter(r => r.included);
  const rowsWithContent = includedRows.filter(r => r.answer1 || r.answer2);

  // Introduction text from original app
  let html = `
    <div class="email-intro">
      Hi <strong>${escapeHtml(profile1Name)}</strong> und <strong>${escapeHtml(profile2Name)}</strong>,<br><br>
      hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde,
      <strong>ihr habt einige Gemeinsamkeiten und Interessen</strong>. Lest euch die Tabelle gerne durch.<br><br>
      <strong>Ihr findet:</strong> Eure Angaben, die Angaben der anderen Person, meine Einschätzung.<br><br>
      <em>Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus.</em>
      Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.<br><br>
    </div>

    <div class="email-section-title"><strong>Eure Gemeinsamkeiten und Profile im Überblick</strong></div>

    <table class="email-table">
      <thead>
        <tr>
          <th>Frage</th>
          <th>${escapeHtml(profile1Name)}</th>
          <th>${escapeHtml(profile2Name)}</th>
          <th>Gemeinsamkeit</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const row of rowsWithContent) {
    // Handle map links in comments
    const commentHtml = formatCommentForPreview(row.comment);
    html += `
      <tr>
        <td><strong>${escapeHtml(row.question)}</strong></td>
        <td>${escapeHtml(row.answer1) || '-'}</td>
        <td>${escapeHtml(row.answer2) || '-'}</td>
        <td class="commonality">${commentHtml}</td>
      </tr>
    `;
  }

  html += `
      </tbody>
    </table>
    <div class="email-outro">
      <br>Ich freue mich über eure Rückmeldung!
    </div>
  `;

  return html;
}

// AI Assistant Modal (like original app) - DSGVO-compliant approach
function showAIAssistModal(row: EditableRow, container: HTMLElement): void {
  // Generate prompt from template
  const promptTemplate = localStorage.getItem('swaf_ai_prompt') || DEFAULT_AI_PROMPT;
  const prompt = promptTemplate
    .replace('{Frage}', row.question)
    .replace('{Antwort1}', row.answer1 || 'keine Angabe')
    .replace('{Antwort2}', row.answer2 || 'keine Angabe');

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'ai-modal-overlay';
  modal.innerHTML = `
    <div class="ai-modal">
      <div class="ai-modal-header">
        <h3>🤖 KI-Unterstützung</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="ai-modal-body">
        <div class="ai-dsgvo-notice">
          <strong>🔒 DSGVO-konform:</strong> Der Text wird nur in deine Zwischenablage kopiert.
          Du entscheidest selbst, ob und welche KI du nutzen möchtest.
          Keine Daten werden automatisch übertragen.
        </div>

        <p>Wähle deinen bevorzugten KI-Assistenten:</p>

        <div class="ai-buttons">
          <button class="btn btn-primary ai-chatgpt">💬 ChatGPT öffnen</button>
          <button class="btn btn-secondary ai-claude">🤖 Claude öffnen</button>
        </div>

        <div class="ai-prompt-section">
          <label>Prompt (wird in Zwischenablage kopiert):</label>
          <textarea class="ai-prompt-text" readonly rows="6">${escapeHtml(prompt)}</textarea>
          <button class="btn btn-outline ai-copy-prompt">📋 Nur Prompt kopieren</button>
        </div>

        <div class="ai-alternatives">
          <details>
            <summary>💡 Alternative: Lokaler Textvorschlag</summary>
            <p>Klicke auf 💡 im Editor für einen automatisch generierten Vorschlag ohne externe KI.</p>
          </details>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('.close-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelector('.ai-chatgpt')?.addEventListener('click', () => {
    navigator.clipboard.writeText(prompt).then(() => {
      window.open('https://chat.openai.com/', '_blank');
      modal.remove();
      showToast('💬 ChatGPT geöffnet - Prompt in Zwischenablage kopiert!');
    });
  });

  modal.querySelector('.ai-claude')?.addEventListener('click', () => {
    navigator.clipboard.writeText(prompt).then(() => {
      window.open('https://claude.ai/', '_blank');
      modal.remove();
      showToast('🤖 Claude geöffnet - Prompt in Zwischenablage kopiert!');
    });
  });

  modal.querySelector('.ai-copy-prompt')?.addEventListener('click', () => {
    navigator.clipboard.writeText(prompt).then(() => {
      const btn = modal.querySelector('.ai-copy-prompt') as HTMLButtonElement;
      btn.textContent = '✓ Kopiert!';
      setTimeout(() => btn.textContent = '📋 Nur Prompt kopieren', 2000);
    });
  });
}

// AI Preview Modal - shows generated texts for review before applying
function showAIPreviewModal(
  results: Map<string, string>,
  fields: Array<{ question: string; answer1: string; answer2: string; rowId: string }>,
  container: HTMLElement
): void {
  // Build preview items
  const previewItems: Array<{
    rowId: string;
    question: string;
    answer1: string;
    answer2: string;
    generated: string;
    selected: boolean;
  }> = [];

  for (const field of fields) {
    const generated = results.get(field.question);
    if (generated) {
      previewItems.push({
        rowId: field.rowId,
        question: field.question,
        answer1: field.answer1,
        answer2: field.answer2,
        generated,
        selected: true  // Default: all selected
      });
    }
  }

  if (previewItems.length === 0) {
    alert('Keine Gemeinsamkeiten gefunden. Die KI konnte keine passenden Texte generieren.');
    return;
  }

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'ai-modal-overlay';
  modal.innerHTML = `
    <div class="ai-modal ai-preview-modal">
      <div class="ai-modal-header">
        <h3>KI-Vorschläge prüfen</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="ai-modal-body">
        <p class="ai-preview-intro">
          <strong>${previewItems.length} Vorschläge generiert.</strong>
          Wähle aus, welche du übernehmen möchtest:
        </p>

        <div class="ai-preview-actions-top">
          <button class="btn btn-sm" id="selectAllBtn">Alle auswählen</button>
          <button class="btn btn-sm btn-outline" id="selectNoneBtn">Keine auswählen</button>
        </div>

        <div class="ai-preview-list">
          ${previewItems.map((item, index) => `
            <div class="ai-preview-item" data-index="${index}">
              <label class="ai-preview-checkbox">
                <input type="checkbox" ${item.selected ? 'checked' : ''} data-index="${index}">
                <span class="checkmark"></span>
              </label>
              <div class="ai-preview-content">
                <div class="ai-preview-question">${escapeHtml(item.question)}</div>
                <div class="ai-preview-answers">
                  <span class="answer-snippet" title="${escapeHtml(item.answer1)}">${escapeHtml(truncateText(item.answer1, 30))}</span>
                  <span class="answer-vs">+</span>
                  <span class="answer-snippet" title="${escapeHtml(item.answer2)}">${escapeHtml(truncateText(item.answer2, 30))}</span>
                </div>
                <div class="ai-preview-generated">"${escapeHtml(item.generated)}"</div>
                <details class="ai-item-prompt">
                  <summary>Prompt anzeigen</summary>
                  <pre class="ai-prompt-mini">${escapeHtml(buildPrompt(item.question, item.answer1, item.answer2))}</pre>
                </details>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="ai-preview-prompt-info">
          <details>
            <summary>Verwendeter Prompt anzeigen</summary>
            <pre class="ai-prompt-display">Du bist ein freundlicher Tandem-Vermittler bei "Start with a Friend".
Analysiere die folgenden zwei Antworten auf die Frage "{Frage}" und
schreibe EINEN kurzen Satz (max. 20 Wörter) der die Gemeinsamkeit oder
Verbindung beschreibt. Schreibe natürlich und persönlich, ohne Emojis,
so als würdest du zwei Freunde einander vorstellen. Wenn es keine
erkennbare Gemeinsamkeit gibt, antworte nur mit "---".

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Gemeinsamkeit:</pre>
          </details>
        </div>

        <div class="ai-preview-actions">
          <button class="btn btn-secondary" id="cancelPreviewBtn">Abbrechen</button>
          <button class="btn btn-primary" id="applyPreviewBtn">
            Ausgewählte übernehmen (<span id="selectedCount">${previewItems.length}</span>)
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Update selected count
  function updateSelectedCount(): void {
    const checked = modal.querySelectorAll('.ai-preview-item input:checked').length;
    const countEl = modal.querySelector('#selectedCount');
    if (countEl) countEl.textContent = String(checked);
  }

  // Event listeners
  modal.querySelector('.close-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelector('#cancelPreviewBtn')?.addEventListener('click', () => modal.remove());

  modal.querySelector('#selectAllBtn')?.addEventListener('click', () => {
    modal.querySelectorAll('.ai-preview-item input').forEach((cb) => {
      (cb as HTMLInputElement).checked = true;
    });
    updateSelectedCount();
  });

  modal.querySelector('#selectNoneBtn')?.addEventListener('click', () => {
    modal.querySelectorAll('.ai-preview-item input').forEach((cb) => {
      (cb as HTMLInputElement).checked = false;
    });
    updateSelectedCount();
  });

  modal.querySelectorAll('.ai-preview-item input').forEach((cb) => {
    cb.addEventListener('change', updateSelectedCount);
  });

  modal.querySelector('#applyPreviewBtn')?.addEventListener('click', () => {
    // Apply selected items
    const checkboxes = modal.querySelectorAll('.ai-preview-item input:checked');
    let appliedCount = 0;

    checkboxes.forEach((cb) => {
      const index = parseInt((cb as HTMLInputElement).dataset.index || '0', 10);
      const item = previewItems[index];
      if (item) {
        const row = rows.find(r => r.id === item.rowId);
        if (row) {
          row.comment = item.generated;
          row.included = true;
          appliedCount++;
        }
      }
    });

    modal.remove();
    renderEditor(container);
    showToast(`${appliedCount} KI-Vorschläge übernommen`);
  });
}

function showToast(message: string): void {
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

// Live AI Preview Modal - shows responses as they're generated in real-time
// Now with individual field updates (no full re-render) and regeneration support
function showLiveAIPreviewModal(
  fields: Array<{ question: string; answer1: string; answer2: string; rowId: string }>,
  container: HTMLElement,
  onComplete: () => void
): void {
  // Track state for each field
  const fieldStates: Array<{
    rowId: string;
    question: string;
    answer1: string;
    answer2: string;
    generated: string;
    status: 'pending' | 'generating' | 'done' | 'error';
    selected: boolean;
  }> = fields.map(f => ({
    ...f,
    generated: '',
    status: 'pending',
    selected: true
  }));

  let isGenerating = true;
  let abortRequested = false;
  let activeRegenerations = new Set<number>();

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'ai-modal-overlay';

  function renderInitialModal(): string {
    return `
      <div class="ai-modal ai-preview-modal ai-live-modal">
        <div class="ai-modal-header">
          <h3>KI-Generierung</h3>
          <div class="ai-progress-info" id="progressInfo">
            <span class="ai-progress-spinner"></span> <span id="progressText">0/${fields.length} generiert</span>
          </div>
          <button class="close-modal">&times;</button>
        </div>
        <div class="ai-modal-body">
          <p class="ai-preview-intro" id="introText">
            <strong>Generiere Vorschläge...</strong> Du kannst bereits fertige Texte bearbeiten und auswählen.
          </p>

          <div class="ai-preview-actions-top">
            <button class="btn btn-sm" id="selectAllBtn">Alle auswählen</button>
            <button class="btn btn-sm btn-outline" id="selectNoneBtn">Keine auswählen</button>
            <button class="btn btn-sm btn-danger" id="stopGenerationBtn">Generation stoppen</button>
          </div>

          <div class="ai-preview-list ai-live-list" id="previewList">
            ${fieldStates.map((item, index) => renderItemHTML(item, index)).join('')}
          </div>

          <div class="ai-preview-actions">
            <button class="btn btn-secondary" id="cancelPreviewBtn">Abbrechen</button>
            <button class="btn btn-primary" id="applyPreviewBtn" disabled>
              Ausgewählte übernehmen (<span id="selectedCount">0</span>)
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderItemHTML(item: typeof fieldStates[0], index: number): string {
    return `
      <div class="ai-preview-item ${item.status}" data-index="${index}" id="preview-item-${index}">
        <label class="ai-preview-checkbox">
          <input type="checkbox" ${item.selected ? 'checked' : ''} ${item.status !== 'done' ? 'disabled' : ''} data-index="${index}">
          <span class="checkmark"></span>
        </label>
        <div class="ai-preview-content">
          <div class="ai-preview-question-row">
            <span class="ai-preview-question">${escapeHtml(item.question)}</span>
            <button class="btn-icon ai-regenerate-btn" data-index="${index}" title="Neu generieren" ${item.status === 'generating' ? 'disabled' : ''}>🔄</button>
          </div>
          <div class="ai-preview-answers">
            <span class="answer-snippet" title="${escapeHtml(item.answer1)}">${escapeHtml(truncateText(item.answer1, 30))}</span>
            <span class="answer-vs">+</span>
            <span class="answer-snippet" title="${escapeHtml(item.answer2)}">${escapeHtml(truncateText(item.answer2, 30))}</span>
          </div>
          <div class="ai-preview-result" id="result-${index}">
            ${renderResultContent(item, index)}
          </div>
          <details class="ai-item-prompt">
            <summary>Prompt anzeigen</summary>
            <pre class="ai-prompt-mini">${escapeHtml(buildPrompt(item.question, item.answer1, item.answer2))}</pre>
          </details>
        </div>
      </div>
    `;
  }

  function renderResultContent(item: typeof fieldStates[0], index: number): string {
    if (item.status === 'pending') {
      return '<div class="ai-preview-pending">Wartet...</div>';
    } else if (item.status === 'generating') {
      return '<div class="ai-preview-generating"><span class="ai-mini-spinner"></span> Generiere...</div>';
    } else if (item.status === 'error') {
      return '<div class="ai-preview-error">Fehler - klicke 🔄 zum erneuten Versuch</div>';
    } else {
      return `<textarea class="ai-preview-textarea" data-index="${index}" rows="4">${escapeHtml(item.generated)}</textarea>`;
    }
  }

  // Update only a single item without touching others
  function updateSingleItem(index: number): void {
    const item = fieldStates[index];
    const itemEl = modal.querySelector(`#preview-item-${index}`);
    if (!itemEl) return;

    // Update status class
    itemEl.className = `ai-preview-item ${item.status}`;

    // Update result content only
    const resultEl = itemEl.querySelector(`#result-${index}`);
    if (resultEl) {
      resultEl.innerHTML = renderResultContent(item, index);
      // Re-attach textarea listener if needed
      const textarea = resultEl.querySelector('.ai-preview-textarea');
      if (textarea) {
        textarea.addEventListener('input', (e) => {
          const target = e.target as HTMLTextAreaElement;
          fieldStates[index].generated = target.value;
        });
      }
    }

    // Update checkbox state
    const checkbox = itemEl.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox) {
      checkbox.disabled = item.status !== 'done';
      checkbox.checked = item.selected;
    }

    // Update regenerate button
    const regenBtn = itemEl.querySelector('.ai-regenerate-btn') as HTMLButtonElement;
    if (regenBtn) {
      regenBtn.disabled = item.status === 'generating';
    }

    updateCounts();
  }

  function updateCounts(): void {
    const doneCount = fieldStates.filter(f => f.status === 'done').length;
    const selectedCount = fieldStates.filter(f => f.selected && f.status === 'done').length;

    // Update progress text
    const progressText = modal.querySelector('#progressText');
    if (progressText) {
      progressText.textContent = `${doneCount}/${fields.length} generiert`;
    }

    // Update selected count
    const countEl = modal.querySelector('#selectedCount');
    if (countEl) countEl.textContent = String(selectedCount);

    // Update apply button
    const applyBtn = modal.querySelector('#applyPreviewBtn') as HTMLButtonElement;
    if (applyBtn) applyBtn.disabled = selectedCount === 0;
  }

  function updateGenerationComplete(): void {
    isGenerating = false;

    // Update progress info
    const progressInfo = modal.querySelector('#progressInfo');
    if (progressInfo) {
      const doneCount = fieldStates.filter(f => f.status === 'done').length;
      progressInfo.innerHTML = `<span id="progressText">${doneCount} Vorschläge generiert</span>`;
    }

    // Update intro text
    const introText = modal.querySelector('#introText');
    if (introText) {
      const doneCount = fieldStates.filter(f => f.status === 'done').length;
      introText.innerHTML = `<strong>${doneCount} Vorschläge generiert.</strong> Wähle aus, welche du übernehmen möchtest:`;
    }

    // Hide stop button
    const stopBtn = modal.querySelector('#stopGenerationBtn');
    if (stopBtn) (stopBtn as HTMLElement).style.display = 'none';
  }

  // Save suggestions to cache (localStorage)
  function saveSuggestionsToCache(): void {
    const cache: Record<string, string> = {};
    for (const item of fieldStates) {
      if (item.status === 'done' && item.generated) {
        // Use question as key
        cache[item.question] = item.generated;
      }
    }
    if (Object.keys(cache).length > 0) {
      localStorage.setItem('swaf_ai_suggestions_cache', JSON.stringify(cache));
    }
  }

  // Load cached suggestions
  function loadSuggestionsFromCache(): void {
    try {
      const cached = localStorage.getItem('swaf_ai_suggestions_cache');
      if (cached) {
        const cache = JSON.parse(cached) as Record<string, string>;
        for (const item of fieldStates) {
          if (cache[item.question] && !item.generated) {
            item.generated = cache[item.question];
            item.status = 'done';
            item.selected = false; // Don't auto-select cached items
          }
        }
      }
    } catch (e) {
      console.warn('Could not load AI suggestions cache:', e);
    }
  }

  function closeModal(): void {
    saveSuggestionsToCache();
    abortRequested = true;
    modal.remove();
    onComplete();
  }

  function attachModalListeners(): void {
    // Close modal - ONLY via X button, not backdrop click
    modal.querySelector('.close-modal')?.addEventListener('click', closeModal);

    // NO backdrop click closing - users were accidentally closing the modal!
    // modal.addEventListener('click', ...) removed intentionally

    // Cancel button
    modal.querySelector('#cancelPreviewBtn')?.addEventListener('click', closeModal);

    // Stop generation button
    modal.querySelector('#stopGenerationBtn')?.addEventListener('click', () => {
      abortRequested = true;
      updateGenerationComplete();
    });

    // Select all/none - update checkboxes directly without re-render
    modal.querySelector('#selectAllBtn')?.addEventListener('click', () => {
      fieldStates.forEach((f, i) => {
        if (f.status === 'done') {
          f.selected = true;
          const checkbox = modal.querySelector(`#preview-item-${i} input[type="checkbox"]`) as HTMLInputElement;
          if (checkbox) checkbox.checked = true;
        }
      });
      updateCounts();
    });
    modal.querySelector('#selectNoneBtn')?.addEventListener('click', () => {
      fieldStates.forEach((f, i) => {
        f.selected = false;
        const checkbox = modal.querySelector(`#preview-item-${i} input[type="checkbox"]`) as HTMLInputElement;
        if (checkbox) checkbox.checked = false;
      });
      updateCounts();
    });

    // Individual checkboxes (use event delegation)
    modal.querySelector('#previewList')?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.type === 'checkbox' && target.dataset.index) {
        const index = parseInt(target.dataset.index, 10);
        fieldStates[index].selected = target.checked;
        updateCounts();
      }
    });

    // Textareas (use event delegation)
    modal.querySelector('#previewList')?.addEventListener('input', (e) => {
      const target = e.target as HTMLTextAreaElement;
      if (target.classList.contains('ai-preview-textarea') && target.dataset.index) {
        const index = parseInt(target.dataset.index, 10);
        fieldStates[index].generated = target.value;
      }
    });

    // Regenerate buttons (use event delegation)
    modal.querySelector('#previewList')?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('ai-regenerate-btn') && target.dataset.index) {
        const index = parseInt(target.dataset.index, 10);
        await regenerateSingle(index);
      }
    });

    // Apply button
    modal.querySelector('#applyPreviewBtn')?.addEventListener('click', () => {
      saveSuggestionsToCache();
      abortRequested = true;
      applySelectedItems();
      modal.remove();
      onComplete();
    });
  }

  async function regenerateSingle(index: number): Promise<void> {
    if (activeRegenerations.has(index)) return;

    const item = fieldStates[index];
    activeRegenerations.add(index);
    item.status = 'generating';
    updateSingleItem(index);

    try {
      const result = await generateCommonality(item.question, item.answer1, item.answer2);
      if (result) {
        item.generated = result;
        item.status = 'done';
        item.selected = true;
      } else {
        item.status = 'error';
      }
    } catch (error) {
      console.warn('Regeneration error:', error);
      item.status = 'error';
    }

    activeRegenerations.delete(index);
    updateSingleItem(index);
  }

  function applySelectedItems(): void {
    let appliedCount = 0;
    for (const item of fieldStates) {
      if (item.selected && item.status === 'done' && item.generated) {
        const row = rows.find(r => r.id === item.rowId);
        if (row) {
          row.comment = item.generated;
          row.included = true;
          appliedCount++;
        }
      }
    }
    renderEditor(container);
    if (appliedCount > 0) {
      showToast(`${appliedCount} KI-Vorschläge übernommen`);
    }
  }

  // Load any cached suggestions first
  loadSuggestionsFromCache();

  // Show modal immediately
  modal.innerHTML = renderInitialModal();
  document.body.appendChild(modal);
  attachModalListeners();

  // Update UI if we loaded cached items
  for (let i = 0; i < fieldStates.length; i++) {
    if (fieldStates[i].status === 'done') {
      updateSingleItem(i);
    }
  }

  // Start generating in background (skip already cached items)
  async function generateAll(): Promise<void> {
    for (let i = 0; i < fieldStates.length; i++) {
      if (abortRequested) break;

      const item = fieldStates[i];

      // Skip items that already have cached content
      if (item.status === 'done' && item.generated) {
        continue;
      }

      item.status = 'generating';
      updateSingleItem(i);

      try {
        const result = await generateCommonality(item.question, item.answer1, item.answer2);
        if (abortRequested) break;

        if (result) {
          item.generated = result;
          item.status = 'done';
        } else {
          item.status = 'error';
          item.selected = false;
        }
      } catch (error) {
        console.warn('Generation error:', error);
        item.status = 'error';
        item.selected = false;
      }

      updateSingleItem(i);
    }

    updateGenerationComplete();
  }

  generateAll();
}

export function getEditorContent(): string {
  const includedRows = rows.filter(r => r.included);
  const rowsWithContent = includedRows.filter(r => r.answer1 || r.answer2);

  // Introduction text from original app
  let text = `Hi ${profile1Name} und ${profile2Name},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;

  // Calculate column widths for proper table alignment
  const colWidths = {
    question: Math.max(10, ...rowsWithContent.map(r => r.question.length)),
    answer1: Math.max(profile1Name.length, ...rowsWithContent.map(r => (r.answer1 || '-').length)),
    answer2: Math.max(profile2Name.length, ...rowsWithContent.map(r => (r.answer2 || '-').length)),
  };

  // Cap widths to reasonable maximums
  colWidths.question = Math.min(colWidths.question, 30);
  colWidths.answer1 = Math.min(colWidths.answer1, 25);
  colWidths.answer2 = Math.min(colWidths.answer2, 25);

  // Table header
  text += padRight('Frage', colWidths.question) + ' | ';
  text += padRight(profile1Name, colWidths.answer1) + ' | ';
  text += padRight(profile2Name, colWidths.answer2) + ' | ';
  text += 'Gemeinsamkeit\n';

  // Separator
  text += '-'.repeat(colWidths.question) + '-+-';
  text += '-'.repeat(colWidths.answer1) + '-+-';
  text += '-'.repeat(colWidths.answer2) + '-+-';
  text += '-'.repeat(20) + '\n';

  // Data rows
  for (const row of rowsWithContent) {
    // Strip map link from text version
    const commentText = stripMapLink(row.comment);
    text += padRight(truncateText(row.question, colWidths.question), colWidths.question) + ' | ';
    text += padRight(truncateText(row.answer1 || '-', colWidths.answer1), colWidths.answer1) + ' | ';
    text += padRight(truncateText(row.answer2 || '-', colWidths.answer2), colWidths.answer2) + ' | ';
    text += (commentText || '') + '\n';
  }

  text += '\nIch freue mich über eure Rückmeldung!\n';

  return text;
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

// HTML version for Word-compatible clipboard (like original app)
export function getEditorContentHTML(): string {
  const includedRows = rows.filter(r => r.included);
  const rowsWithContent = includedRows.filter(r => r.answer1 || r.answer2);

  // Word-optimized HTML with inline styles
  let html = `<!--StartFragment-->
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.5; }
  table { border-collapse: collapse; width: 100%; margin: 15px 0; }
  th { background-color: #009892; color: white; font-weight: bold; padding: 10px; text-align: left; border: 1px solid #ccc; }
  td { padding: 8px 10px; border: 1px solid #ccc; vertical-align: top; }
  tr:nth-child(even) { background-color: #f8f8f8; }
  .intro { margin-bottom: 20px; }
  .section-title { font-size: 14pt; font-weight: bold; color: #C3003B; margin: 20px 0 10px 0; }
  .commonality { color: #009892; font-style: italic; }
</style>
</head>
<body>
<div class="intro">
  Hi <strong>${escapeHtml(profile1Name)}</strong> und <strong>${escapeHtml(profile2Name)}</strong>,<br><br>
  hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde,
  <strong>ihr habt einige Gemeinsamkeiten und Interessen</strong>. Lest euch die Tabelle gerne durch.<br><br>
  <strong>Ihr findet:</strong> Eure Angaben, die Angaben der anderen Person, meine Einschätzung.<br><br>
  <em>Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus.</em>
  Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.
</div>

<div class="section-title">Eure Gemeinsamkeiten und Profile im Überblick</div>

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Frage</th>
      <th style="width: 25%;">${escapeHtml(profile1Name)}</th>
      <th style="width: 25%;">${escapeHtml(profile2Name)}</th>
      <th style="width: 25%;">Gemeinsamkeit</th>
    </tr>
  </thead>
  <tbody>
`;

  for (const row of rowsWithContent) {
    // Format comment with clickable map link for Word
    const commentHtml = formatCommentForWord(row.comment);
    html += `    <tr>
      <td><strong>${escapeHtml(row.question)}</strong></td>
      <td>${escapeHtml(row.answer1) || '-'}</td>
      <td>${escapeHtml(row.answer2) || '-'}</td>
      <td class="commonality">${commentHtml}</td>
    </tr>
`;
  }

  html += `  </tbody>
</table>

<p><br>Ich freue mich über eure Rückmeldung!</p>
</body>
</html>
<!--EndFragment-->`;

  return html;
}

export function getEditorCommonalities(): Commonality[] {
  return rows.filter(r => r.included).map(row => ({
    question: row.question,
    answer1: row.answer1,
    answer2: row.answer2,
    commonality: row.comment,
  }));
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

function escapeHtml(text: string): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Helper to extract map link URL from comment
function extractMapLink(comment: string): string | null {
  if (!comment) return null;
  const match = comment.match(/\[🗺️\]\((https?:\/\/[^)]+)\)/);
  return match ? match[1] : null;
}

// Strip map link markdown from comment text
function stripMapLink(comment: string): string {
  if (!comment) return '';
  return comment.replace(/\s*\[🗺️\]\(https?:\/\/[^)]+\)/, '').trim();
}

// Render map link as button if present
function renderMapLinkButton(comment: string): string {
  const url = extractMapLink(comment);
  if (!url) return '';
  return `<a href="${url}" target="_blank" class="btn-icon map-link-btn" title="Route in Google Maps öffnen">🗺️</a>`;
}

// Format comment for email preview (convert markdown link to HTML link)
function formatCommentForPreview(comment: string): string {
  if (!comment) return '';
  const url = extractMapLink(comment);
  if (url) {
    const textPart = stripMapLink(comment);
    return `${escapeHtml(textPart)} <a href="${url}" target="_blank" class="map-link">🗺️ Route</a>`;
  }
  return escapeHtml(comment);
}

// Format comment for Word export (clickable link)
function formatCommentForWord(comment: string): string {
  if (!comment) return '';
  const url = extractMapLink(comment);
  if (url) {
    const textPart = stripMapLink(comment);
    return `${escapeHtml(textPart)} <a href="${url}" style="color: #009892;">🗺️ Route anzeigen</a>`;
  }
  return escapeHtml(comment);
}
