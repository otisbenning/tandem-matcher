// Helper Utilities
import type { Profile } from '@shared/types';

// Extract PLZ from profile
export function extractPLZ(profile: Profile): string | null {
  const plzField = profile.fields.find(f =>
    f.question.toLowerCase().includes('plz') ||
    f.question.toLowerCase().includes('postleitzahl')
  );

  if (plzField?.answer) {
    const match = plzField.answer.match(/\d{5}/);
    return match ? match[0] : null;
  }

  // Try to find PLZ in any field
  for (const field of profile.fields) {
    const match = field.answer.match(/\b\d{5}\b/);
    if (match) return match[0];
  }

  return null;
}

// Extract group (local/newcomer) from profile
export function extractGroup(profile: Profile): 'local' | 'newcomer' {
  const newcomerPatterns = [
    /newcomer/i,
    /geflüchtet/i,
    /migrant/i,
    /zugewandert/i,
    /immigrant/i,
    /einwander/i,
    /neuankommend/i,
    /geflohene?/i,
    /refugee/i,
    /asyl/i,
    /zuwander/i,
  ];

  const localPatterns = [
    /\blocal\b/i,
    /einheimisch/i,
    /hier.*geboren/i,
    /alteingesessen/i,
    /ortsansässig/i,
  ];

  // Helper to check all newcomer patterns
  const isNewcomer = (text: string): boolean => {
    return newcomerPatterns.some(p => p.test(text));
  };

  // Helper to check all local patterns
  const isLocal = (text: string): boolean => {
    return localPatterns.some(p => p.test(text));
  };

  // Check page type first (often contains "Einwander*innen" or "Locals")
  if (profile.pageType) {
    if (isNewcomer(profile.pageType)) return 'newcomer';
    if (isLocal(profile.pageType)) return 'local';
  }

  // Check profile name (sometimes contains group info)
  if (profile.name) {
    if (isNewcomer(profile.name)) return 'newcomer';
    if (isLocal(profile.name)) return 'local';
  }

  // Check URL
  if (profile.url) {
    if (isNewcomer(profile.url)) return 'newcomer';
    if (isLocal(profile.url)) return 'local';
  }

  // Check all fields - prioritize finding group/status fields
  for (const field of profile.fields) {
    const q = field.question.toLowerCase();
    const a = field.answer;

    // High priority fields
    if (q.includes('gruppe') || q.includes('status') || q.includes('wer bist') ||
        q.includes('local') || q.includes('newcomer') || q.includes('herkunft') ||
        q.includes('aufnahme') || q.includes('teilnehmer')) {
      if (isNewcomer(a)) return 'newcomer';
      if (isLocal(a)) return 'local';
    }
  }

  // Check remaining fields for any hints
  for (const field of profile.fields) {
    if (isNewcomer(field.answer)) return 'newcomer';
  }

  // Default to local if unclear
  return 'local';
}

// Extract age from profile
export function extractAge(profile: Profile): number | null {
  const ageField = profile.fields.find(f =>
    f.question.toLowerCase().includes('alter') &&
    !f.question.toLowerCase().includes('unterschied') &&
    !f.question.toLowerCase().includes('präferenz')
  );

  if (ageField?.answer) {
    const match = ageField.answer.match(/\d+/);
    if (match) {
      const age = parseInt(match[0]);
      if (age >= 16 && age <= 100) return age;
    }
  }

  // Try birth year
  const birthField = profile.fields.find(f =>
    f.question.toLowerCase().includes('geboren') ||
    f.question.toLowerCase().includes('geburtsjahr')
  );

  if (birthField?.answer) {
    const yearMatch = birthField.answer.match(/(19|20)\d{2}/);
    if (yearMatch) {
      const birthYear = parseInt(yearMatch[0]);
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (age >= 16 && age <= 100) return age;
    }
  }

  return null;
}

// Extract gender from profile
export function extractGender(profile: Profile): 'male' | 'female' | 'other' | null {
  const genderField = profile.fields.find(f =>
    f.question.toLowerCase().includes('geschlecht') &&
    !f.question.toLowerCase().includes('präferenz') &&
    !f.question.toLowerCase().includes('partner')
  );

  if (genderField?.answer) {
    const answer = genderField.answer.toLowerCase();
    if (answer.includes('männlich') || answer.includes('mann') || answer === 'm') {
      return 'male';
    }
    if (answer.includes('weiblich') || answer.includes('frau') || answer === 'w' || answer === 'f') {
      return 'female';
    }
    if (answer.includes('divers') || answer.includes('sonstig') || answer.includes('andere')) {
      return 'other';
    }
  }

  return null;
}

// Get field value by pattern matching
export function getFieldValue(profile: Profile, patterns: string[]): string | null {
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'i');
    const field = profile.fields.find(f => regex.test(f.question));
    if (field?.answer) return field.answer;
  }
  return null;
}

// Normalize hobby names for comparison
const hobbyMappings: Record<string, string[]> = {
  'sport': ['sport', 'fitness', 'training', 'gym', 'workout'],
  'fussball': ['fußball', 'fussball', 'soccer', 'kicken'],
  'musik': ['musik', 'music', 'konzert', 'singen', 'instrument'],
  'lesen': ['lesen', 'bücher', 'reading', 'books'],
  'kochen': ['kochen', 'cooking', 'backen', 'küche'],
  'reisen': ['reisen', 'travel', 'urlaub', 'reise'],
  'kino': ['kino', 'filme', 'movies', 'cinema', 'film'],
  'gaming': ['gaming', 'videospiele', 'spiele', 'zocken', 'games'],
  'wandern': ['wandern', 'hiking', 'spazieren', 'natur'],
  'fotografie': ['fotografie', 'photography', 'fotos', 'fotografieren'],
  'kunst': ['kunst', 'art', 'malen', 'zeichnen', 'museum'],
  'tanzen': ['tanzen', 'dance', 'dancing', 'tanz'],
  'yoga': ['yoga', 'meditation', 'entspannung'],
  'schwimmen': ['schwimmen', 'swimming', 'baden'],
  'radfahren': ['radfahren', 'fahrrad', 'cycling', 'bike', 'rad'],
  'laufen': ['laufen', 'joggen', 'running', 'jogging'],
  'sprachen': ['sprachen', 'languages', 'sprachkurs'],
  'essen': ['essen', 'food', 'kulinarik', 'restaurant'],
  'feiern': ['feiern', 'party', 'ausgehen', 'club', 'bar'],
  'natur': ['natur', 'nature', 'garten', 'pflanzen', 'outdoor'],
};

export function normalizeHobby(hobby: string): string {
  const lowerHobby = hobby.toLowerCase().trim();

  for (const [normalized, variants] of Object.entries(hobbyMappings)) {
    if (variants.some(v => lowerHobby.includes(v))) {
      return normalized;
    }
  }

  // Return cleaned version if no mapping found
  return lowerHobby.replace(/[^a-zäöüß]/gi, '');
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
