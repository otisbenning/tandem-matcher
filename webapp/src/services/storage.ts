// Storage Service - localStorage Management
import type { Profile, Tandem, GamificationStats, PLZCacheEntry, ProfileExport } from '@shared/types';

const STORAGE_KEYS = {
  PROFILES: 'swaf_profiles',
  TANDEMS: 'swaf_tandems',
  GAMIFICATION: 'swaf_gamification_stats',
  PLZ_CACHE: 'swaf_plz_cache',
  SETTINGS: 'swaf_settings',
} as const;

// In-memory state
let profiles: Profile[] = [];
let tandems: Tandem[] = [];
let gamificationStats: GamificationStats = getDefaultGamificationStats();
let plzCache: Map<string, PLZCacheEntry> = new Map();

function getDefaultGamificationStats(): GamificationStats {
  return {
    totalMatches: 0,
    todayMatches: 0,
    lastMatchDate: '',
    streak: 0,
    qualityScores: [],
    achievements: [],
    totalPoints: 0,
  };
}

// Initialize storage - load from localStorage
export async function initStorage(): Promise<void> {
  try {
    // Load profiles
    const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (storedProfiles) {
      profiles = JSON.parse(storedProfiles);
    }

    // Load tandems
    const storedTandems = localStorage.getItem(STORAGE_KEYS.TANDEMS);
    if (storedTandems) {
      tandems = JSON.parse(storedTandems);
    }

    // Load gamification stats
    const storedStats = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
    if (storedStats) {
      gamificationStats = { ...getDefaultGamificationStats(), ...JSON.parse(storedStats) };
    }

    // Load PLZ cache
    const storedPlzCache = localStorage.getItem(STORAGE_KEYS.PLZ_CACHE);
    if (storedPlzCache) {
      const cacheObj = JSON.parse(storedPlzCache);
      plzCache = new Map(Object.entries(cacheObj));
    }

    console.log(`Storage initialized: ${profiles.length} profiles, ${tandems.length} tandems`);
  } catch (error) {
    console.error('Error loading storage:', error);
  }
}

// Profile functions
export function getProfiles(): Profile[] {
  return [...profiles];
}

export function getProfileById(id: string): Profile | undefined {
  return profiles.find(p => p.id === id);
}

export function addProfiles(newProfiles: Profile[]): void {
  const existingIds = new Set(profiles.map(p => p.id));
  const existingNames = new Set(profiles.map(p => normalizeName(p.name)));

  for (const profile of newProfiles) {
    // Skip duplicates by ID
    if (existingIds.has(profile.id)) continue;

    // Check for name duplicates and merge if needed
    const normalizedName = normalizeName(profile.name);
    if (existingNames.has(normalizedName)) {
      const existingProfile = profiles.find(p => normalizeName(p.name) === normalizedName);
      if (existingProfile) {
        // Merge fields
        mergeProfileFields(existingProfile, profile);
        continue;
      }
    }

    profiles.push(profile);
    existingIds.add(profile.id);
    existingNames.add(normalizedName);
  }

  saveProfiles();
}

function mergeProfileFields(target: Profile, source: Profile): void {
  const existingQuestions = new Set(target.fields.map(f => f.question));

  for (const field of source.fields) {
    if (!existingQuestions.has(field.question)) {
      target.fields.push(field);
    }
  }

  target.pageType = 'Merged';
  target.timestamp = Math.max(target.timestamp, source.timestamp);
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function deleteProfile(id: string): void {
  profiles = profiles.filter(p => p.id !== id);
  saveProfiles();
}

export function clearProfiles(): void {
  profiles = [];
  saveProfiles();
}

function saveProfiles(): void {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  window.dispatchEvent(new CustomEvent('profiles-updated'));
}

// Tandem functions
export function getTandems(): Tandem[] {
  return [...tandems];
}

export function addTandem(tandem: Tandem): void {
  tandems.push(tandem);
  saveTandems();

  // Update gamification
  gamificationStats.totalMatches++;
  gamificationStats.todayMatches++;
  gamificationStats.lastMatchDate = new Date().toISOString().split('T')[0];
  gamificationStats.qualityScores.push(tandem.matchScore);
  saveGamificationStats();
}

export function deleteTandem(id: string): void {
  tandems = tandems.filter(t => t.id !== id);
  saveTandems();
}

export function updateTandem(id: string, updates: Partial<Tandem>): void {
  const index = tandems.findIndex(t => t.id === id);
  if (index !== -1) {
    tandems[index] = { ...tandems[index], ...updates };
    saveTandems();
  }
}

export function getTandemById(id: string): Tandem | undefined {
  return tandems.find(t => t.id === id);
}

// Get all profile IDs that are currently in tandems (matched)
export function getMatchedProfileIds(): Set<string> {
  const matchedIds = new Set<string>();
  for (const tandem of tandems) {
    matchedIds.add(tandem.profile1.id);
    matchedIds.add(tandem.profile2.id);
  }
  return matchedIds;
}

// Get tandem for a specific profile
export function getTandemForProfile(profileId: string): Tandem | undefined {
  return tandems.find(t => t.profile1.id === profileId || t.profile2.id === profileId);
}

function saveTandems(): void {
  localStorage.setItem(STORAGE_KEYS.TANDEMS, JSON.stringify(tandems));
  window.dispatchEvent(new CustomEvent('tandems-updated'));
}

// Gamification functions
export function getGamificationStats(): GamificationStats {
  return { ...gamificationStats };
}

function saveGamificationStats(): void {
  localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(gamificationStats));
}

// PLZ Cache functions
export function getPLZCache(plz: string): PLZCacheEntry | undefined {
  return plzCache.get(plz);
}

export function setPLZCache(plz: string, entry: PLZCacheEntry): void {
  plzCache.set(plz, entry);
  const cacheObj = Object.fromEntries(plzCache);
  localStorage.setItem(STORAGE_KEYS.PLZ_CACHE, JSON.stringify(cacheObj));
}

// Import/Export functions
export function exportData(): ProfileExport {
  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    profiles: profiles,
  };
}

export function importData(data: ProfileExport): number {
  if (!data.profiles || !Array.isArray(data.profiles)) {
    throw new Error('Ungültiges Datenformat');
  }

  const countBefore = profiles.length;
  addProfiles(data.profiles);
  return profiles.length - countBefore;
}

// Full backup/restore
export function createBackup(): string {
  return JSON.stringify({
    profiles,
    tandems,
    gamificationStats,
    plzCache: Object.fromEntries(plzCache),
    exportedAt: new Date().toISOString(),
    version: '2.0',
  });
}

export function restoreBackup(backupJson: string): void {
  const data = JSON.parse(backupJson);

  if (data.profiles) profiles = data.profiles;
  if (data.tandems) tandems = data.tandems;
  if (data.gamificationStats) gamificationStats = data.gamificationStats;
  if (data.plzCache) plzCache = new Map(Object.entries(data.plzCache));

  saveProfiles();
  saveTandems();
  saveGamificationStats();
  localStorage.setItem(STORAGE_KEYS.PLZ_CACHE, JSON.stringify(Object.fromEntries(plzCache)));
}

// Custom Prompt functions
const CUSTOM_PROMPT_KEY = 'swaf_custom_prompt';

export function getCustomPrompt(): string | null {
  return localStorage.getItem(CUSTOM_PROMPT_KEY);
}

export function saveCustomPrompt(prompt: string): void {
  localStorage.setItem(CUSTOM_PROMPT_KEY, prompt);
}

export function clearCustomPrompt(): void {
  localStorage.removeItem(CUSTOM_PROMPT_KEY);
}
