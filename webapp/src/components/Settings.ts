// Settings Component - Export & Settings Tab
import { getTandems, getProfiles, createBackup, restoreBackup, getGamificationStats } from '../services/storage';
import type { Tandem } from '@shared/types';

export function initSettings(): void {
  const exportExcelBtn = document.getElementById('exportExcel');
  const exportCSVBtn = document.getElementById('exportCSV');
  const exportJSONBtn = document.getElementById('exportJSON');
  const importBackupBtn = document.getElementById('importBackup');

  exportExcelBtn?.addEventListener('click', exportAsExcel);
  exportCSVBtn?.addEventListener('click', exportAsCSV);
  exportJSONBtn?.addEventListener('click', exportAsJSON);
  importBackupBtn?.addEventListener('click', importBackupFile);

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
