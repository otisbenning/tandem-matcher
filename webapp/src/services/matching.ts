// Matching Service - Match quality calculation
import type { Profile, MatchResult, Commonality } from '@shared/types';
import { extractAge, extractGender, extractPLZ, extractGroup, normalizeHobby } from '../utils/helpers';

// =============================================
// FELDER DIE VOM MATCHING AUSGESCHLOSSEN WERDEN
// =============================================
const EXCLUDED_FIELDS = [
  // Namen und IDs - KOMPLETT AUSSCHLIESSEN
  'vorname', 'nachname', 'name', 'vollständiger name',
  'e-mail-adresse', 'e-mail', 'email', 'telefonnummer', 'telefon',

  // Administrative Felder
  'id', 'user-id', 'teilnehmer-id', 'profil-id',
  'gruppe', 'standort', 'region', 'west', 'ost', 'nord', 'süd',
  'vermittler', 'vermittler*in', 'durchgeführt von', 'durchgeführt',
  'datum/uhrzeit', 'datum', 'uhrzeit', 'termin', 'terminart',
  'status', 'bearbeitungsstatus', 'anmeldestatus',
  'infoabend', 'infonachmittag', 'format', 'aufnahmegespräch',

  // System-/Meta-Felder
  'standort-newsletter', 'newsletter', 'dsgvo', 'einverständnis',
  'notizen', 'interne notizen', 'bemerkungen admin',
  'url', 'link', 'portal-link',

  // Bewertungs-/Einschätzungsfelder (subjektiv - vermittler-bezogen)
  'wie wirkt die person auf dich', 'eindruck', 'bewertung',
  'wie schätzt du ein', 'einschätzung', 'beurteilung',

  // Prozess-/Workflow-Felder
  'sind weitere schritte nötig', 'nächste schritte', 'follow-up',
  'aufnahmegespräch datum', 'gespräch datum',

  // Triviale Felder
  'plz', 'postleitzahl', 'ort', 'stadt', 'köln', 'berlin', 'münchen',
  'ausgeschlossen', 'ausgetreten', 'pausiert', 'vermittelt', 'unvermittelt',
  'angemeldet', 'beginn', 'ende'
];

// Antworten die ignoriert werden sollen (zu kurz, leer, generisch)
const EXCLUDED_ANSWERS = [
  'egal', 'keine', 'nein', 'ja', '-', '​', '', ' ',
  'männlich', 'weiblich', 'divers',
  'durchgeführt', 'infoabend', 'infonachmittag',
  'formatbeginnende', 'ausgeschlossen', 'ausgetreten',
  'west', 'ost', 'nord', 'süd', 'mitte',
  'public', 'user', 'admin', 'system',
  'local', 'newcomer', 'immigrant', 'einwanderer'
];

// Wörter die in Gemeinsamkeiten ignoriert werden sollen
const EXCLUDED_COMMONALITY_WORDS = [
  'infoabend', 'aufnahmegespräch', 'gespräch', 'termin',
  'public', 'user', 'admin', 'system', 'portal',
  'durchgeführt', 'angemeldet', 'vermittelt',
  'status', 'format', 'beginn', 'ende',
  'local', 'newcomer', 'immigrant'
];

// Prüft ob ein Feld vom Matching ausgeschlossen werden soll
function shouldExcludeFromMatching(question: string): boolean {
  const normalized = question.toLowerCase().trim();

  // Leere oder sehr kurze Fragen
  if (normalized.length < 3) return true;

  // Prüfe auf Geschlecht-Feld (eigenes Geschlecht, nicht Präferenz)
  if (normalized === 'geschlecht' || normalized === 'dein geschlecht') return true;

  return EXCLUDED_FIELDS.some(excluded =>
    normalized.includes(excluded) || excluded.includes(normalized)
  );
}

// Prüft ob eine Antwort zu trivial/generisch ist
function isTrivialAnswer(answer: string): boolean {
  const normalized = answer.toLowerCase().trim();

  // Leere oder sehr kurze Antworten
  if (normalized.length < 2) return true;

  // HTML-artige Inhalte
  if (normalized.includes('<') || normalized.includes('>')) return true;
  if (normalized.includes('dropdown') || normalized.includes('select')) return true;

  // Zero-width spaces und andere Unicode-Müll
  if (/[\u200B-\u200D\uFEFF]/.test(normalized)) return true;

  // System-IDs oder technische Strings
  if (/^[a-f0-9-]{36}$/.test(normalized)) return true; // UUID
  if (/^\d{10,}$/.test(normalized)) return true; // Timestamps

  // Generische Antworten
  return EXCLUDED_ANSWERS.some(excluded =>
    normalized === excluded || normalized.startsWith(excluded + ' ')
  );
}

// Filtert Müll-Wörter aus Gemeinsamkeiten-Text
function filterGarbageWords(words: string[]): string[] {
  return words.filter(word => {
    const normalized = word.toLowerCase().trim();
    if (normalized.length < 3) return false;
    if (EXCLUDED_COMMONALITY_WORDS.some(ex => normalized.includes(ex))) return false;
    // Filtere technische Begriffe
    if (/^[a-f0-9-]+$/.test(normalized)) return false;
    return true;
  });
}

// Get field value by pattern matching (excluding irrelevant fields)
function getFieldValue(profile: Profile, patterns: string[]): string | null {
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'i');
    const field = profile.fields.find(f =>
      regex.test(f.question) && !shouldExcludeFromMatching(f.question)
    );
    if (field?.answer) return field.answer;
  }
  return null;
}

// =============================================
// HARD FACTS CHECK - Müssen alle erfüllt sein
// =============================================
export function calculateMatchResult(profile1: Profile, profile2: Profile): MatchResult {
  const details: string[] = [];

  // ==========================================
  // HARD FACT 0: NUR INTERKULTURELLE MATCHES!
  // Local ↔ Newcomer, nie innerhalb der Gruppe
  // ==========================================
  const group1 = extractGroup(profile1);
  const group2 = extractGroup(profile2);

  if (group1 === group2) {
    return {
      compatible: false,
      score: 0,
      failReason: 'same_group',
      failDetails: `Beide sind ${group1 === 'local' ? 'Locals' : 'Newcomer'} - nur interkulturelle Matches möglich`,
      softFactsScore: 0,
      softFactsMax: 15,
    };
  }

  // HARD FACT 1: Alterspräferenz
  const ageCheck = checkAgePreference(profile1, profile2);
  if (!ageCheck.pass) {
    return {
      compatible: false,
      score: 0,
      failReason: 'age_preference',
      failDetails: ageCheck.reason,
      softFactsScore: 0,
      softFactsMax: 15,
    };
  }

  // HARD FACT 2: Geschlechtspräferenz
  const genderCheck = checkGenderPreference(profile1, profile2);
  if (!genderCheck.pass) {
    return {
      compatible: false,
      score: 0,
      failReason: 'gender_preference',
      failDetails: genderCheck.reason,
      softFactsScore: 0,
      softFactsMax: 15,
    };
  }

  // HARD FACT 3: Zeitüberschneidung
  const timeCheck = checkTimeOverlap(profile1, profile2);
  if (!timeCheck.pass) {
    return {
      compatible: false,
      score: 0,
      failReason: 'time_overlap',
      failDetails: timeCheck.reason,
      softFactsScore: 0,
      softFactsMax: 15,
    };
  }

  // ==========================================
  // SOFT FACTS - Beeinflussen den Match-Score
  // ==========================================
  const positiveFactors: string[] = [];
  const softFactsScore = calculateSoftFactsScore(profile1, profile2, details, positiveFactors);
  const maxScore = 15;
  const normalizedScore = Math.min(5, Math.round((softFactsScore / maxScore) * 5));

  return {
    compatible: true,
    score: normalizedScore,
    softFactsScore,
    softFactsMax: maxScore,
    details: details.join('; '),
    positiveFactors: positiveFactors.slice(0, 3), // Top 3 positive factors
  };
}

// Age Preference Check
function checkAgePreference(profile1: Profile, profile2: Profile): { pass: boolean; reason?: string } {
  const age1 = extractAge(profile1);
  const age2 = extractAge(profile2);

  if (!age1 || !age2) return { pass: true }; // No age data = pass

  const ageDiff = Math.abs(age1 - age2);

  // Find age preference fields
  const pref1 = getFieldValue(profile1, ['alter.*unterschied', 'alter.*tandem', 'wie groß.*alter']);
  const pref2 = getFieldValue(profile2, ['alter.*unterschied', 'alter.*tandem', 'wie groß.*alter']);

  // Check profile1's preference
  if (pref1) {
    const prefLower = pref1.toLowerCase();

    if (prefLower.includes('egal')) {
      // OK
    } else if (prefLower.includes('±') || prefLower.includes('+/-')) {
      const match = prefLower.match(/(\d+)/);
      if (match && ageDiff > parseInt(match[1])) {
        return { pass: false, reason: `${profile1.name}: Alterspräferenz "${pref1}" nicht erfüllt (Diff: ${ageDiff} Jahre)` };
      }
    } else {
      // Check for specific year ranges
      const yearMatch = prefLower.match(/(\d+)\s*jahre?/);
      if (yearMatch && ageDiff > parseInt(yearMatch[1])) {
        return { pass: false, reason: `${profile1.name}: Alterspräferenz "${pref1}" nicht erfüllt (Diff: ${ageDiff} Jahre)` };
      }
    }

    // Check older/younger preferences
    if (prefLower.includes('älter') && !prefLower.includes('jünger') && !prefLower.includes('egal')) {
      if (age2 < age1) {
        return { pass: false, reason: `${profile1.name}: Präferiert älteren Partner` };
      }
    }
    if (prefLower.includes('jünger') && !prefLower.includes('älter') && !prefLower.includes('egal')) {
      if (age2 > age1) {
        return { pass: false, reason: `${profile1.name}: Präferiert jüngeren Partner` };
      }
    }
  }

  // Check profile2's preference
  if (pref2) {
    const prefLower = pref2.toLowerCase();

    if (prefLower.includes('egal')) {
      // OK
    } else if (prefLower.includes('±') || prefLower.includes('+/-')) {
      const match = prefLower.match(/(\d+)/);
      if (match && ageDiff > parseInt(match[1])) {
        return { pass: false, reason: `${profile2.name}: Alterspräferenz "${pref2}" nicht erfüllt (Diff: ${ageDiff} Jahre)` };
      }
    } else {
      const yearMatch = prefLower.match(/(\d+)\s*jahre?/);
      if (yearMatch && ageDiff > parseInt(yearMatch[1])) {
        return { pass: false, reason: `${profile2.name}: Alterspräferenz "${pref2}" nicht erfüllt (Diff: ${ageDiff} Jahre)` };
      }
    }

    if (prefLower.includes('älter') && !prefLower.includes('jünger') && !prefLower.includes('egal')) {
      if (age1 < age2) {
        return { pass: false, reason: `${profile2.name}: Präferiert älteren Partner` };
      }
    }
    if (prefLower.includes('jünger') && !prefLower.includes('älter') && !prefLower.includes('egal')) {
      if (age1 > age2) {
        return { pass: false, reason: `${profile2.name}: Präferiert jüngeren Partner` };
      }
    }
  }

  return { pass: true };
}

// Gender Preference Check
function checkGenderPreference(profile1: Profile, profile2: Profile): { pass: boolean; reason?: string } {
  const gender1 = extractGender(profile1);
  const gender2 = extractGender(profile2);

  // Find gender preference fields (for tandem partner)
  const pref1 = getFieldValue(profile1, ['geschlecht.*tandem', 'geschlecht.*partner']);
  const pref2 = getFieldValue(profile2, ['geschlecht.*tandem', 'geschlecht.*partner']);

  // Check profile1's preference against profile2's gender
  if (pref1 && gender2) {
    const prefLower = pref1.toLowerCase();

    if (!prefLower.includes('egal') && !prefLower.includes('keine')) {
      if ((prefLower.includes('nur frauen') || prefLower.includes('frauen*')) && gender2 !== 'female') {
        return { pass: false, reason: `${profile1.name}: Geschlechtspräferenz "${pref1}" nicht erfüllt` };
      }
      if ((prefLower.includes('nur männer') || prefLower.includes('männer*')) && gender2 !== 'male') {
        return { pass: false, reason: `${profile1.name}: Geschlechtspräferenz "${pref1}" nicht erfüllt` };
      }
    }
  }

  // Check profile2's preference against profile1's gender
  if (pref2 && gender1) {
    const prefLower = pref2.toLowerCase();

    if (!prefLower.includes('egal') && !prefLower.includes('keine')) {
      if ((prefLower.includes('nur frauen') || prefLower.includes('frauen*')) && gender1 !== 'female') {
        return { pass: false, reason: `${profile2.name}: Geschlechtspräferenz "${pref2}" nicht erfüllt` };
      }
      if ((prefLower.includes('nur männer') || prefLower.includes('männer*')) && gender1 !== 'male') {
        return { pass: false, reason: `${profile2.name}: Geschlechtspräferenz "${pref2}" nicht erfüllt` };
      }
    }
  }

  return { pass: true };
}

// Time Overlap Check
function checkTimeOverlap(profile1: Profile, profile2: Profile): { pass: boolean; reason?: string } {
  const time1 = getFieldValue(profile1, ['zeit.*treffen', 'zeit.*tandem', 'wann.*zeit']);
  const time2 = getFieldValue(profile2, ['zeit.*treffen', 'zeit.*tandem', 'wann.*zeit']);

  if (!time1 || !time2) return { pass: true }; // No time data = pass

  const time1Lower = time1.toLowerCase();
  const time2Lower = time2.toLowerCase();

  // If either is flexible, pass
  if (time1Lower.includes('flexibel') || time2Lower.includes('flexibel')) {
    return { pass: true };
  }

  // Check for time overlaps
  const timeOptions = ['morgens', 'mittags', 'nachmittags', 'abends', 'unter der woche', 'wochenende'];

  const commonTimes = timeOptions.filter(t =>
    time1Lower.includes(t) && time2Lower.includes(t)
  );

  if (commonTimes.length === 0) {
    return { pass: false, reason: 'Keine gemeinsamen Zeitfenster gefunden' };
  }

  return { pass: true };
}

// ==========================================
// SOFT FACTS SCORE CALCULATION
// ==========================================
function calculateSoftFactsScore(profile1: Profile, profile2: Profile, reasons: string[], positiveFactors: string[]): number {
  let score = 0;

  // 1. PLZ-Distanz (max 3 Punkte - HÖCHSTE PRIORITÄT!)
  const plz1 = extractPLZ(profile1);
  const plz2 = extractPLZ(profile2);
  if (plz1 && plz2) {
    const plz1First2 = parseInt(plz1.substring(0, 2));
    const plz2First2 = parseInt(plz2.substring(0, 2));
    const plzDiff = Math.abs(plz1First2 - plz2First2);

    if (plz1 === plz2) {
      score += 3;
      reasons.push('Gleiche PLZ');
      positiveFactors.push('Gleiche PLZ');
    } else if (plzDiff === 0) {
      score += 2.5;
      reasons.push('Gleiche Region (< 10 km)');
      positiveFactors.push('Nah beieinander');
    } else if (plzDiff === 1) {
      score += 2;
      reasons.push('Benachbarte Region');
      positiveFactors.push('Benachbarte Region');
    } else if (plzDiff <= 3) {
      score += 1.5;
      reasons.push('Nahe Region');
    } else if (plzDiff <= 5) {
      score += 1;
    } else {
      score += 0.5;
    }
  }

  // 2. Alter-Ähnlichkeit (max 2 Punkte)
  const age1 = extractAge(profile1);
  const age2 = extractAge(profile2);
  if (age1 && age2) {
    const ageDiff = Math.abs(age1 - age2);
    if (ageDiff <= 3) {
      score += 2;
      reasons.push(`Sehr ähnliches Alter (±${ageDiff} Jahre)`);
      positiveFactors.push(ageDiff === 0 ? 'Gleich alt' : `Nur ${ageDiff}J Unterschied`);
    } else if (ageDiff <= 5) {
      score += 1.8;
      reasons.push(`Ähnliches Alter (±${ageDiff} Jahre)`);
      positiveFactors.push('Ähnliches Alter');
    } else if (ageDiff <= 10) {
      score += 1.5;
    } else if (ageDiff <= 15) {
      score += 1;
    } else if (ageDiff <= 20) {
      score += 0.5;
    }
  }

  // 3. Geschlechtspräferenz erfüllt (Bonus 1 Punkt)
  const genderPref1 = getFieldValue(profile1, ['geschlecht.*tandem', 'geschlecht.*partner']);
  const genderPref2 = getFieldValue(profile2, ['geschlecht.*tandem', 'geschlecht.*partner']);
  if (genderPref1 || genderPref2) {
    score += 1;
    reasons.push('Geschlechtspräferenz erfüllt');
  }

  // 4. Interkulturell (immer erfüllt da wir nur interkulturelle Matches erlauben)
  score += 1;
  reasons.push('Interkulturell');

  // 5. Hobbys (max 2 Punkte)
  const hobbies1 = getFieldValue(profile1, ['hobby', 'hobbies', 'hobbys']);
  const hobbies2 = getFieldValue(profile2, ['hobby', 'hobbies', 'hobbys']);
  if (hobbies1 && hobbies2) {
    const commonHobbies = findCommonHobbies(hobbies1, hobbies2);
    if (commonHobbies.length > 0) {
      const hobbyScore = Math.min(2, commonHobbies.length * 0.4);
      score += hobbyScore;
      if (commonHobbies.length >= 3) {
        reasons.push('Viele gemeinsame Hobbys');
        positiveFactors.push('Viele gemeinsame Hobbys');
      } else if (commonHobbies.length >= 2) {
        reasons.push('Mehrere gemeinsame Hobbys');
        positiveFactors.push('Gemeinsame Hobbys');
      } else {
        reasons.push('Gemeinsame Hobby-Interessen');
      }
    }
  }

  // 6. Freizeit-Interessen (max 1.5 Punkte) - OHNE Vermittler-Felder
  const leisure1 = getFieldValue(profile1, ['freizeit(?!.*vermittler)']);
  const leisure2 = getFieldValue(profile2, ['freizeit(?!.*vermittler)']);
  if (leisure1 && leisure2) {
    const commonWords = findCommonWords(leisure1, leisure2);
    if (commonWords.length >= 3) {
      score += 1.5;
      reasons.push('Ähnliche Freizeitinteressen');
    } else if (commonWords.length >= 1) {
      score += 0.75;
    }
  }

  // 7. Themen-Interessen (max 1.5 Punkte)
  const topics1 = getFieldValue(profile1, ['themen.*interessieren', 'interess.*themen']);
  const topics2 = getFieldValue(profile2, ['themen.*interessieren', 'interess.*themen']);
  if (topics1 && topics2) {
    const interestKeywords = ['politik', 'kunst', 'kultur', 'technologie', 'sport', 'musik', 'natur', 'reisen', 'essen', 'kochen', 'wissenschaft', 'geschichte', 'literatur'];
    const t1 = topics1.toLowerCase();
    const t2 = topics2.toLowerCase();
    const commonInterests = interestKeywords.filter(kw => t1.includes(kw) && t2.includes(kw));

    if (commonInterests.length >= 2) {
      score += 1.5;
      reasons.push('Mehrere gemeinsame Interessensgebiete');
      positiveFactors.push('Ähnliche Interessen');
    } else if (commonInterests.length === 1) {
      score += 0.75;
      reasons.push('Gemeinsame Interessensgebiete');
    }
  }

  // 8. Freundschafts-Werte (max 1.5 Punkte)
  const values1 = getFieldValue(profile1, ['freundschaft.*wichtig', 'wichtig.*freundschaft']);
  const values2 = getFieldValue(profile2, ['freundschaft.*wichtig', 'wichtig.*freundschaft']);
  if (values1 && values2) {
    const valueKeywords = ['ehrlichkeit', 'vertrauen', 'respekt', 'toleranz', 'humor', 'offenheit', 'zuverlässigkeit', 'loyalität', 'treue'];
    const v1 = values1.toLowerCase();
    const v2 = values2.toLowerCase();
    const commonValues = valueKeywords.filter(kw => v1.includes(kw) && v2.includes(kw));

    if (commonValues.length >= 2) {
      score += 1.5;
      reasons.push('Ähnliche Wertvorstellungen');
      positiveFactors.push('Ähnliche Werte');
    } else if (commonValues.length === 1) {
      score += 0.75;
    }
  }

  // 9. Tandem-Vorstellung (max 1 Punkt)
  const vision1 = getFieldValue(profile1, ['tandem.*vorstellung(?!.*geschlecht)']);
  const vision2 = getFieldValue(profile2, ['tandem.*vorstellung(?!.*geschlecht)']);
  if (vision1 && vision2) {
    const commonWords = findCommonWords(vision1, vision2);
    if (commonWords.length >= 2) {
      score += 1;
      reasons.push('Ähnliche Tandem-Vorstellungen');
    } else if (commonWords.length >= 1) {
      score += 0.5;
    }
  }

  // 10. Community-Events (max 0.5 Punkte)
  const events1 = getFieldValue(profile1, ['community-event', 'event.*unternehmen']);
  const events2 = getFieldValue(profile2, ['community-event', 'event.*unternehmen']);
  if (events1 && events2) {
    const ev1 = events1.toLowerCase();
    const ev2 = events2.toLowerCase();
    if ((ev1.includes('ja') || ev1.includes('gerne')) && (ev2.includes('ja') || ev2.includes('gerne'))) {
      score += 0.5;
    }
  }

  return score;
}

function findCommonHobbies(hobbies1: string, hobbies2: string): string[] {
  const normalized1 = hobbies1.split(/[,;]/).map(h => normalizeHobby(h.trim())).filter(Boolean);
  const normalized2 = hobbies2.split(/[,;]/).map(h => normalizeHobby(h.trim())).filter(Boolean);

  return normalized1.filter(h1 => normalized2.some(h2 => h1 === h2));
}

function findCommonWords(text1: string, text2: string): string[] {
  const stopWords = new Set(['und', 'oder', 'der', 'die', 'das', 'ein', 'eine', 'mit', 'für', 'von', 'zu', 'ich', 'mir', 'mich', 'gerne', 'sehr', 'auch', 'aber', 'dass', 'wenn', 'weil', 'nicht', 'mehr', 'noch', 'schon', 'immer']);

  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));

  return words1.filter(w1 => words2.some(w2 => w1 === w2 || w1.includes(w2) || w2.includes(w1)));
}

// ==========================================
// COMMONALITIES FOR DISPLAY
// ==========================================
export function findCommonalities(profile1: Profile, profile2: Profile): Commonality[] {
  const commonalities: Commonality[] = [];

  // Compare all fields (excluding admin fields)
  for (const field1 of profile1.fields) {
    if (shouldExcludeFromMatching(field1.question)) continue;

    const matchingField = profile2.fields.find(f =>
      normalizeQuestion(f.question) === normalizeQuestion(field1.question) &&
      !shouldExcludeFromMatching(f.question)
    );

    if (matchingField && field1.answer && matchingField.answer) {
      const commonality = findCommonality(field1.question, field1.answer, matchingField.answer);
      if (commonality) {
        commonalities.push({
          question: field1.question,
          answer1: field1.answer,
          answer2: matchingField.answer,
          commonality,
        });
      }
    }
  }

  return commonalities;
}

function normalizeQuestion(question: string): string {
  return question.toLowerCase().replace(/[?!.,:]/g, '').trim();
}

function findCommonality(question: string, answer1: string, answer2: string): string | null {
  // Skip trivial answers
  if (isTrivialAnswer(answer1) || isTrivialAnswer(answer2)) {
    return null;
  }

  // Skip very short answers
  if (answer1.length < 5 || answer2.length < 5) {
    return null;
  }

  const q = question.toLowerCase();
  const a1 = answer1.toLowerCase().trim();
  const a2 = answer2.toLowerCase().trim();

  // Skip if answers contain system/admin terms
  const systemTerms = ['infoabend', 'aufnahmegespräch', 'durchgeführt', 'public', 'user', 'admin'];
  if (systemTerms.some(term => a1.includes(term) || a2.includes(term))) {
    return null;
  }

  // Skip if answers are just single generic words
  if (a1.split(/\s+/).length <= 1 || a2.split(/\s+/).length <= 1) {
    // Unless it's a meaningful single word like a city or specific interest
    const meaningfulSingleWords = ['kochen', 'reisen', 'sport', 'musik', 'tanzen', 'lesen', 'wandern', 'yoga', 'schwimmen', 'radfahren', 'joggen'];
    if (!meaningfulSingleWords.some(w => a1.includes(w) || a2.includes(w))) {
      return null;
    }
  }

  // Hobbies/Interests - handle specially
  if (q.includes('hobby') || q.includes('interesse') || q.includes('freizeit') || q.includes('ausprobieren')) {
    const common = findCommonHobbies(answer1, answer2);
    // Filter garbage and deduplicate
    const filteredCommon = filterGarbageWords([...new Set(common)]);
    if (filteredCommon.length > 0) {
      if (filteredCommon.length === 1) {
        return `Gemeinsames Hobby: ${filteredCommon[0]}`;
      }
      return `Gemeinsame Interessen: ${filteredCommon.slice(0, 4).join(', ')}`;
    }
    return null;
  }

  // Languages - special handling
  if (q.includes('sprache')) {
    const langs1 = answer1.split(/[,;]/).map(l => l.trim().toLowerCase()).filter(l => l.length > 2);
    const langs2 = answer2.split(/[,;]/).map(l => l.trim().toLowerCase()).filter(l => l.length > 2);

    // Filter out garbage
    const validLangs1 = filterGarbageWords(langs1);
    const validLangs2 = filterGarbageWords(langs2);

    const common = validLangs1.filter(l => validLangs2.some(l2 => l.includes(l2) || l2.includes(l)));
    if (common.length > 0) {
      return `Gemeinsame Sprachen: ${[...new Set(common)].join(', ')}`;
    }
    return null;
  }

  // Age analysis
  if (q.includes('alter') || q.includes('geburt')) {
    const age1 = parseInt(a1);
    const age2 = parseInt(a2);
    if (!isNaN(age1) && !isNaN(age2)) {
      const diff = Math.abs(age1 - age2);
      if (diff === 0) return 'Genau gleich alt!';
      if (diff <= 3) return `Nur ${diff} Jahr${diff > 1 ? 'e' : ''} Unterschied`;
      if (diff <= 7) return `${diff} Jahre Unterschied - passt gut zusammen`;
      if (diff <= 12) return `Verschiedene Lebenserfahrungen (${diff} Jahre Unterschied)`;
    }
    return null;
  }

  // Friendship values - special handling
  if (q.includes('freundschaft') || q.includes('wichtig')) {
    const valueKeywords = ['ehrlichkeit', 'vertrauen', 'respekt', 'toleranz', 'humor', 'offenheit', 'zuverlässigkeit', 'loyalität', 'treue', 'gemeinsamkeiten', 'kommunikation'];
    const common = valueKeywords.filter(kw => a1.includes(kw) && a2.includes(kw));
    if (common.length > 0) {
      return `Gemeinsame Werte: ${common.join(', ')}`;
    }
    return null;
  }

  // Time preferences
  if (q.includes('zeit') || q.includes('treffen') || q.includes('wann')) {
    const timeOptions = ['morgens', 'mittags', 'nachmittags', 'abends', 'wochenende', 'unter der woche', 'flexibel'];
    const common = timeOptions.filter(t => a1.includes(t) && a2.includes(t));
    if (common.length > 0) {
      return `Gemeinsame Zeitfenster: ${common.join(', ')}`;
    }
    return null;
  }

  // Exact match - only for meaningful content (not system values)
  if (a1 === a2 && a1.length > 10) {
    // Skip if it looks like a name or system value
    if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(answer1)) return null; // Looks like a name
    // Truncate long answers
    const displayAnswer = answer1.length > 50 ? answer1.substring(0, 50) + '...' : answer1;
    return `Übereinstimmung: "${displayAnswer}"`;
  }

  // Common words for open text fields (only if substantial and filtered)
  if (answer1.length > 20 && answer2.length > 20) {
    const common = findCommonWords(answer1, answer2);
    const filteredCommon = filterGarbageWords(common);
    if (filteredCommon.length >= 3) {
      return `Ähnliche Themen: ${filteredCommon.slice(0, 4).join(', ')}`;
    }
  }

  return null;
}

// Export helper for external use
export { shouldExcludeFromMatching };
