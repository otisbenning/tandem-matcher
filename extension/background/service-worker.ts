// Service Worker - Background script for Chrome Extension
import type { Profile, ExtensionMessage, ExtensionResponse, ProfileExport } from '@shared/types';

// Extended Profile with completeness status
interface StoredProfile extends Profile {
  hasHauptprofil: boolean;
  hasInterview: boolean;
  isComplete: boolean;
}

// Storage key for collected profiles
const STORAGE_KEY = 'tandem_profiles';

// Get all stored profiles
async function getStoredProfiles(): Promise<StoredProfile[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

// Save profiles to storage
async function saveProfiles(profiles: StoredProfile[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: profiles });
  updateBadge(profiles);
}

// Extract clean name from profile
function extractCleanName(profile: Profile): string {
  let name = profile.name;

  // Remove "Aufnahmegespräch Einwander*innen" or "Aufnahmegespräch Locals" prefix
  name = name.replace(/^Aufnahmegespräch\s+(Einwander\*innen|Locals)\s*[\(\)]*\s*/i, '');

  // Remove trailing parentheses content if it's just whitespace
  name = name.replace(/\s*\(\s*\)\s*$/, '');

  // Clean up extra whitespace
  name = name.replace(/\s+/g, ' ').trim();

  // Remove trailing/leading parentheses
  name = name.replace(/^\(|\)$/g, '').trim();

  return name || profile.name;
}

// Normalize name for matching
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\säöüß]/gi, '')
    .trim();
}

// Check if two names match (fuzzy)
function namesMatch(name1: string, name2: string): boolean {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);

  if (n1 === n2) return true;

  // Check if one contains the other (for partial names)
  if (n1.includes(n2) || n2.includes(n1)) return true;

  // Check word overlap
  const words1 = n1.split(' ').filter(w => w.length > 2);
  const words2 = n2.split(' ').filter(w => w.length > 2);

  const commonWords = words1.filter(w => words2.includes(w));
  return commonWords.length >= Math.min(words1.length, words2.length, 2);
}

// Add a new profile (with smart merging)
async function addProfile(profile: Profile): Promise<{ isNew: boolean; profile: StoredProfile }> {
  const profiles = await getStoredProfiles();
  const cleanName = extractCleanName(profile);

  // Determine if this is an interview based on pageType or URL
  const isInterview = profile.pageType === 'Interview' || profile.url.includes('/survey/');
  const isHauptprofil = profile.pageType === 'Hauptprofil' ||
                        (profile.url.includes('/web') && profile.url.includes('swaf.participant'));

  console.log('Processing profile:', cleanName, '| pageType:', profile.pageType, '| isInterview:', isInterview, '| isHauptprofil:', isHauptprofil);

  // Find existing profile with matching name
  const existingIndex = profiles.findIndex(p => {
    const existingCleanName = extractCleanName(p);
    return namesMatch(existingCleanName, cleanName) || namesMatch(p.name, cleanName);
  });

  if (existingIndex >= 0) {
    // Merge with existing profile
    const existing = profiles[existingIndex];
    mergeProfiles(existing, profile, isInterview, isHauptprofil);
    existing.name = cleanName; // Use clean name
    await saveProfiles(profiles);
    console.log('Merged profile:', cleanName, '| hasHP:', existing.hasHauptprofil, '| hasInt:', existing.hasInterview, '| complete:', existing.isComplete);
    return { isNew: false, profile: existing };
  }

  // Create new profile
  const newProfile: StoredProfile = {
    ...profile,
    name: cleanName,
    hasHauptprofil: isHauptprofil,
    hasInterview: isInterview,
    isComplete: isHauptprofil && isInterview,
    pageType: isInterview ? 'Interview' : 'Hauptprofil',
  };

  profiles.push(newProfile);
  await saveProfiles(profiles);
  console.log('Added new profile:', cleanName, isInterview ? '(Interview)' : '(Hauptprofil)');
  return { isNew: true, profile: newProfile };
}

// Merge two profiles
function mergeProfiles(target: StoredProfile, source: Profile, sourceIsInterview: boolean, sourceIsHauptprofil: boolean): void {
  // Add fields that don't exist yet
  const existingQuestions = new Set(target.fields.map(f => f.question.toLowerCase()));

  for (const field of source.fields) {
    if (!existingQuestions.has(field.question.toLowerCase())) {
      target.fields.push(field);
    }
  }

  // Update completeness status based on what the source provides
  if (sourceIsInterview) {
    target.hasInterview = true;
  }
  if (sourceIsHauptprofil) {
    target.hasHauptprofil = true;
  }

  target.isComplete = target.hasHauptprofil && target.hasInterview;
  target.pageType = target.isComplete ? 'Merged' : target.pageType;
  target.timestamp = Math.max(target.timestamp, source.timestamp);

  console.log('After merge: hasHP:', target.hasHauptprofil, '| hasInt:', target.hasInterview, '| complete:', target.isComplete);
}

// Delete a profile
async function deleteProfile(id: string): Promise<void> {
  const profiles = await getStoredProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  await saveProfiles(filtered);
}

// Clear all profiles
async function clearAllProfiles(): Promise<void> {
  await saveProfiles([]);
}

// Scan all open portal tabs
async function scanAllTabs(): Promise<{ scanned: number; added: number; merged: number }> {
  const tabs = await chrome.tabs.query({ url: 'https://portal.startwithafriend.de/*' });
  let scanned = 0;
  let added = 0;
  let merged = 0;

  for (const tab of tabs) {
    if (!tab.id) continue;

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'SCAN_ALL_TABS' });
      scanned++;

      if (response?.success && response.data) {
        const result = await addProfile(response.data as Profile);
        if (result.isNew) {
          added++;
        } else {
          merged++;
        }
      }
    } catch (error) {
      console.log('Could not scan tab:', tab.url, (error as Error).message);
    }
  }

  return { scanned, added, merged };
}

// Export profiles as JSON
async function exportProfiles(): Promise<ProfileExport> {
  const profiles = await getStoredProfiles();
  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    profiles: profiles,
  };
}

// Update badge with profile count and completeness
function updateBadge(profiles: StoredProfile[]): void {
  const total = profiles.length;
  const incomplete = profiles.filter(p => !p.isComplete).length;

  chrome.action.setBadgeText({ text: total > 0 ? String(total) : '' });

  // Red badge if incomplete profiles exist, blue otherwise
  chrome.action.setBadgeBackgroundColor({
    color: incomplete > 0 ? '#ef4444' : '#2563eb'
  });
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  _sender,
  sendResponse: (response: ExtensionResponse) => void
) => {
  handleMessage(message).then(sendResponse);
  return true;
});

async function handleMessage(message: ExtensionMessage): Promise<ExtensionResponse> {
  try {
    switch (message.type) {
      case 'PROFILE_EXTRACTED': {
        const profile = message.payload as Profile;
        const result = await addProfile(profile);
        return { success: true, data: { isNew: result.isNew, profile: result.profile } };
      }

      case 'GET_PROFILES': {
        const profiles = await getStoredProfiles();
        return { success: true, data: profiles };
      }

      case 'CLEAR_PROFILES': {
        await clearAllProfiles();
        return { success: true };
      }

      case 'SCAN_ALL_TABS': {
        const result = await scanAllTabs();
        return { success: true, data: result };
      }

      case 'DELETE_PROFILE' as any: {
        await deleteProfile((message as any).payload as string);
        return { success: true };
      }

      default:
        return { success: false, error: 'Unknown message type' };
    }
  } catch (error) {
    console.error('Message handler error:', error);
    return { success: false, error: String(error) };
  }
}

// Initialize badge on startup
getStoredProfiles().then(profiles => {
  updateBadge(profiles);
});

// Open popup as separate window (stays open when clicking elsewhere)
chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 400,
    height: 600,
    top: 100,
    left: 100
  });
});

console.log('Tandem-Matcher Service Worker initialized');
