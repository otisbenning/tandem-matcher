// Gemeinsame TypeScript-Typen für Extension und WebApp

export interface ProfileField {
  question: string;
  answer: string;
}

export interface Profile {
  id: string;
  url: string;
  name: string;
  pageType: 'Hauptprofil' | 'Interview' | 'Merged';
  timestamp: number;
  fields: ProfileField[];
}

export interface ProfileExport {
  version: string;
  exportedAt: string;
  profiles: Profile[];
}

export interface MatchResult {
  compatible: boolean;
  score: number; // 0-5 Sterne
  failReason?: 'age_preference' | 'gender_preference' | 'time_overlap' | 'same_group';
  failDetails?: string;
  softFactsScore: number;
  softFactsMax: number;
  details?: string;
  positiveFactors?: string[]; // Positive Match-Gründe als Teaser
}

export interface Commonality {
  question: string;
  answer1: string;
  answer2: string;
  commonality: string;
}

export interface Tandem {
  id: string;
  profile1: Profile;
  profile2: Profile;
  name: string;
  created: string;
  commonalities: Commonality[];
  matchScore: number;
  suggestionText?: string; // Bearbeitbarer Vorschlagstext für E-Mail
}

export interface GamificationStats {
  totalMatches: number;
  todayMatches: number;
  lastMatchDate: string;
  streak: number;
  qualityScores: number[];
  achievements: Achievement[];
  totalPoints: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

// PLZ Cache für Geocoding
export interface PLZCacheEntry {
  lat: number;
  lng: number;
  city?: string;
}

// Extension-spezifische Messages
export interface ExtensionMessage {
  type: 'PROFILE_EXTRACTED' | 'SCAN_ALL_TABS' | 'GET_PROFILES' | 'CLEAR_PROFILES';
  payload?: unknown;
}

export interface ExtensionResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Filter-Optionen für Profil-Suche
export interface ProfileFilter {
  gender?: 'male' | 'female' | 'other' | 'all';
  group?: 'local' | 'newcomer' | 'all';
  ageMin?: number;
  ageMax?: number;
  searchText?: string;
  plz?: string;
}

// Smart Match Ergebnis
export interface SmartMatchResult {
  profile: Profile;
  matchResult: MatchResult;
  distance?: number;
  distanceText?: string;
}
