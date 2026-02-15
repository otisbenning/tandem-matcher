// Content Script - Extracts profile data from portal.startwithafriend.de
import type { Profile, ProfileField, ExtensionMessage } from '@shared/types';

console.log('TandemMatcher: Content script loaded');
console.log('TandemMatcher: URL =', window.location.href);
console.log('TandemMatcher: Pathname =', window.location.pathname);
console.log('TandemMatcher: Hash =', window.location.hash);

// Determine page type from URL
function getPageType(): 'Hauptprofil' | 'Interview' | null {
  const url = window.location.href;
  const pathname = window.location.pathname;
  const hash = window.location.hash;

  console.log('TandemMatcher: getPageType() checking URL:', url);

  // Interview/Survey pages: /survey/...
  if (pathname.includes('/survey/') || pathname.startsWith('/survey')) {
    console.log('TandemMatcher: -> Interview (survey in pathname)');
    return 'Interview';
  }

  // Hauptprofil: /web with swaf.participant in hash
  // URLs look like: /web?#id=123&model=swaf.participant&...
  if (pathname === '/web' || pathname.startsWith('/web')) {
    if (hash.includes('swaf.participant')) {
      console.log('TandemMatcher: -> Hauptprofil (swaf.participant in hash)');
      return 'Hauptprofil';
    }
  }

  // Fallback: check full URL for participant
  if (url.includes('swaf.participant') && !url.includes('/survey/')) {
    console.log('TandemMatcher: -> Hauptprofil (swaf.participant in URL, not survey)');
    return 'Hauptprofil';
  }

  // Legacy patterns
  if (pathname.includes('/profile') || pathname.includes('/user') || pathname.includes('/member')) {
    console.log('TandemMatcher: -> Hauptprofil (legacy path)');
    return 'Hauptprofil';
  }

  console.log('TandemMatcher: -> Unknown page type');
  return null;
}

// Check if we're on a profile page
function isProfilePage(): boolean {
  return getPageType() !== null;
}

// Extract profile data from the page
function extractProfileData(): Profile | null {
  try {
    const detectedPageType = getPageType();
    console.log('TandemMatcher: Extracting data, page type:', detectedPageType);

    if (!detectedPageType) {
      console.log('TandemMatcher: Not a recognized profile page');
      return null;
    }

    let pageType: Profile['pageType'] = detectedPageType;
    let name = '';
    const fields: ProfileField[] = [];

    // Detect page type and extract accordingly
    if (detectedPageType === 'Interview') {
      // Interview/Survey page
      pageType = 'Interview';

      // Find name from breadcrumb or header
      const breadcrumb = document.querySelector('.breadcrumb-item.active, .o_survey_title, h1');
      name = breadcrumb?.textContent?.trim() || '';

      // Extract survey questions and answers
      document.querySelectorAll('.js_question-wrapper, .o_survey_question').forEach(wrapper => {
        const questionEl = wrapper.querySelector('h2, .o_survey_question_title, label');
        if (!questionEl) return;

        const question = questionEl.textContent?.trim().replace(/\s+/g, ' ') || '';
        const answers: string[] = [];

        // Checkboxes and radios
        wrapper.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked').forEach(input => {
          const label = input.closest('label') || input.nextElementSibling;
          if (label) answers.push(label.textContent?.trim() || '');
        });

        // Select dropdowns
        wrapper.querySelectorAll('select').forEach(select => {
          const sel = select as HTMLSelectElement;
          if (sel.selectedIndex > 0) {
            answers.push(sel.options[sel.selectedIndex].text.trim());
          }
        });

        // Textareas
        wrapper.querySelectorAll('textarea').forEach(ta => {
          const textarea = ta as HTMLTextAreaElement;
          if (textarea.value?.trim()) answers.push(textarea.value.trim());
        });

        // Text inputs
        wrapper.querySelectorAll('input[type="text"], input[type="email"], input[type="number"]').forEach(inp => {
          const input = inp as HTMLInputElement;
          if (input.value?.trim()) answers.push(input.value.trim());
        });

        const answer = answers.filter(a => a).join(', ');
        if (question && answer) {
          fields.push({ question, answer });
        }
      });

    } else if (detectedPageType === 'Hauptprofil') {
      // Hauptprofil (Odoo form)

      // Find name
      const nameField = document.querySelector('span[name="name"], input[name="name"], .o_field_widget[name="name"]');
      if (nameField) {
        name = (nameField as HTMLInputElement).value || nameField.textContent?.trim() || '';
      }
      if (!name) {
        const h1 = document.querySelector('h1, .o_form_sheet h2');
        name = h1?.textContent?.trim() || '';
      }

      // Extract Odoo form fields
      const processedFields = new Set<string>();

      // Method 1: Label + Field pairs
      document.querySelectorAll('label.o_form_label').forEach(label => {
        const labelText = label.textContent?.trim().replace(':', '') || '';
        const forId = label.getAttribute('for');

        let fieldValue = '';

        if (forId) {
          const input = document.getElementById(forId);
          if (input) {
            fieldValue = (input as HTMLInputElement).value || input.textContent?.trim() || '';
          }
        }

        // Also check sibling/nearby field widget
        if (!fieldValue) {
          const row = label.closest('tr, .o_wrap_field, .o_cell');
          if (row) {
            const widget = row.querySelector('.o_field_widget, span[name], input');
            if (widget) {
              fieldValue = (widget as HTMLInputElement).value || widget.textContent?.trim() || '';
            }
          }
        }

        if (labelText && fieldValue && labelText !== fieldValue && !processedFields.has(labelText)) {
          fields.push({ question: labelText, answer: fieldValue });
          processedFields.add(labelText);
        }
      });

      // Method 2: Field widgets with name attribute
      document.querySelectorAll('.o_field_widget[name]').forEach(widget => {
        const fieldName = widget.getAttribute('name') || '';
        if (processedFields.has(fieldName)) return;

        // Find associated label
        const label = document.querySelector(`label[for="${fieldName}"], label.o_form_label[for="${fieldName}"]`);
        const labelText = label?.textContent?.trim().replace(':', '') || fieldName;

        const value = (widget as HTMLInputElement).value || widget.textContent?.trim() || '';

        if (labelText && value && value.length < 1000) {
          fields.push({ question: labelText, answer: value });
          processedFields.add(fieldName);
        }
      });
    }

    // Fallback: Generic extraction
    if (fields.length === 0) {
      console.log('TandemMatcher: Using fallback extraction...');

      // Try dt/dd pairs
      document.querySelectorAll('dt').forEach(dt => {
        const dd = dt.nextElementSibling;
        if (dd?.tagName === 'DD') {
          const question = dt.textContent?.trim() || '';
          const answer = dd.textContent?.trim() || '';
          if (question && answer) fields.push({ question, answer });
        }
      });

      // Try table rows
      document.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 2) {
          const question = cells[0].textContent?.trim() || '';
          const answer = cells[1].textContent?.trim() || '';
          if (question && answer && question.length < 200) {
            fields.push({ question, answer });
          }
        }
      });
    }

    // Find name if still not found
    if (!name) {
      const h1 = document.querySelector('h1');
      name = h1?.textContent?.trim() || 'Unbekannt_' + Date.now();
    }

    if (fields.length === 0) {
      console.log('TandemMatcher: No fields found');
      return null;
    }

    const profile: Profile = {
      id: crypto.randomUUID(),
      url: window.location.href,
      name,
      pageType,
      timestamp: Date.now(),
      fields,
    };

    console.log('TandemMatcher: Extracted profile', profile.name, 'with', fields.length, 'fields');
    return profile;

  } catch (error) {
    console.error('TandemMatcher: Error extracting profile', error);
    return null;
  }
}

// Send extracted profile to background script
function sendProfileToBackground(profile: Profile): void {
  chrome.runtime.sendMessage({
    type: 'PROFILE_EXTRACTED',
    payload: profile,
  });
}

// Auto-extract on page load if on profile page
if (isProfilePage()) {
  console.log('TandemMatcher: Profile page detected, will extract on load');

  if (document.readyState === 'complete') {
    const profile = extractProfileData();
    if (profile) sendProfileToBackground(profile);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const profile = extractProfileData();
        if (profile) sendProfileToBackground(profile);
      }, 1000); // Wait for dynamic content
    });
  }
}

// ALWAYS listen for scan requests (even if not auto-detected as profile page)
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  console.log('TandemMatcher: Received message', message.type);

  if (message.type === 'SCAN_ALL_TABS') {
    const profile = extractProfileData();
    console.log('TandemMatcher: Scan result', profile ? 'success' : 'no profile');
    sendResponse({ success: !!profile, data: profile });
  }
  return true;
});

// Expose for debugging
(window as any).extractTandemProfile = extractProfileData;
console.log('TandemMatcher: Content script ready. Use extractTandemProfile() to manually extract.');
