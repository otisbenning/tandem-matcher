// Tandem-Matcher v2.0 - Main Entry Point
import { initStorage } from './services/storage';
import { initMap } from './components/MapView';
import { initProfileList } from './components/ProfileList';
import { initSmartMatch } from './components/SmartMatchPanel';
import { initImportModal } from './components/ImportModal';
import { initTandemList } from './components/TandemList';
import { initSettings } from './components/Settings';
import { getOllamaStatus } from './services/ollama';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Tandem-Matcher v2.0 initialisiert');

  // Load data from localStorage
  await initStorage();

  // Initialize components
  initTabs();
  initImportModal();
  initMap();
  initProfileList();
  initSmartMatch();
  initTandemList();
  initSettings();
  initMobileToggle();

  // Check for auto-paste from clipboard (extension)
  initAutoClipboard();

  // Initialize help modal
  initHelpModal();

  // Check Ollama status for settings page
  checkOllamaStatus();
});

// Tab Navigation
function initTabs() {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.tab');
  const contents = document.querySelectorAll<HTMLElement>('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      if (!targetId) return;

      // Update active states
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      contents.forEach(content => {
        content.classList.toggle('active', content.id === `${targetId}-tab`);
      });
    });
  });
}

// Mobile View Toggle (Map/List)
function initMobileToggle() {
  const viewBtns = document.querySelectorAll<HTMLButtonElement>('.view-btn');
  const sidebar = document.getElementById('profileSidebar');
  const mapContainer = document.getElementById('mapContainer');

  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (!view || !sidebar || !mapContainer) return;

      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (view === 'list') {
        sidebar.classList.add('mobile-visible');
        mapContainer.classList.add('mobile-hidden');
      } else {
        sidebar.classList.remove('mobile-visible');
        mapContainer.classList.remove('mobile-hidden');

        // Leaflet needs to recalculate size when container becomes visible
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          window.dispatchEvent(new Event('map-needs-resize'));
        }, 100);
      }
    });
  });
}

// Check Ollama availability for settings page
async function checkOllamaStatus() {
  const statusEl = document.getElementById('ollamaStatus');
  if (!statusEl) return;

  try {
    const status = await getOllamaStatus();

    if (status.available && status.model) {
      statusEl.className = 'ollama-status available';
      statusEl.textContent = `Verfügbar: ${status.model}`;
    } else if (status.available) {
      statusEl.className = 'ollama-status unavailable';
      statusEl.textContent = 'Ollama läuft, aber kein Modell installiert';
    } else {
      statusEl.className = 'ollama-status unavailable';
      statusEl.textContent = 'Nicht verfügbar - Ollama installieren';
    }
  } catch {
    statusEl.className = 'ollama-status unavailable';
    statusEl.textContent = 'Nicht verfügbar';
  }
}

// Help Modal
function initHelpModal() {
  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeBtn = document.getElementById('closeHelpModal');

  helpBtn?.addEventListener('click', () => {
    helpModal?.classList.add('visible');
  });

  closeBtn?.addEventListener('click', () => {
    helpModal?.classList.remove('visible');
  });

  // Close on backdrop click
  helpModal?.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.classList.remove('visible');
    }
  });

  // Show help on first visit
  if (!localStorage.getItem('swaf_help_shown')) {
    setTimeout(() => {
      helpModal?.classList.add('visible');
      localStorage.setItem('swaf_help_shown', 'true');
    }, 500);
  }
}

// Auto-clipboard detection when window gains focus
function initAutoClipboard() {
  window.addEventListener('focus', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.includes('"version"') && text.includes('"profiles"')) {
        // Looks like profile export data
        const shouldImport = confirm('Profile-Daten in der Zwischenablage erkannt. Importieren?');
        if (shouldImport) {
          window.dispatchEvent(new CustomEvent('import-from-clipboard', { detail: text }));
        }
      }
    } catch {
      // Clipboard access denied or empty - that's fine
    }
  });
}

// Export for debugging
declare global {
  interface Window {
    TandemMatcher: {
      version: string;
    };
  }
}

window.TandemMatcher = {
  version: '2.0.0'
};
