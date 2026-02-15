// Ollama Service - LLM Integration for text generation
// Hosted at api.swaf.koeln - DSGVO-compliant (eigener Server)

const OLLAMA_URL = 'https://api.swaf.koeln/ollama';

// Basic Auth credentials for Ollama API
const OLLAMA_USER = 'ollama';
const OLLAMA_PASS = 'Tandem2026Matcher';

// Common headers for all requests
function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(`${OLLAMA_USER}:${OLLAMA_PASS}`),
  };
}

// Check if Ollama is running
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    console.log('🤖 Prüfe Ollama-Verfügbarkeit...');
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      headers: getHeaders(),
      signal: AbortSignal.timeout(5000), // 5 second timeout for remote
    });
    console.log(`🤖 Ollama Response: ${response.status} ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.warn('🤖 Ollama nicht erreichbar:', error);
    return false;
  }
}

// Get available models
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      headers: getHeaders(),
    });
    if (!response.ok) return [];

    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

// Default model on the server
const DEFAULT_MODEL = 'mistral:7b';

// Find the best available model
export async function findBestModel(): Promise<string | null> {
  const available = await getAvailableModels();
  if (available.length === 0) {
    // Server might still work with default model even if tags fails
    return DEFAULT_MODEL;
  }

  // Use mistral if available, otherwise first model
  if (available.some(m => m.includes('mistral'))) {
    return available.find(m => m.includes('mistral')) || DEFAULT_MODEL;
  }

  return available[0] || DEFAULT_MODEL;
}

// Category-specific prompts for better AI responses
// WICHTIG:
// - Aus Sicht des VERMITTLERS schreiben
// - Die Lesenden sehen die Original-Antworten in einer Tabelle daneben!
// - Gemeinsamkeiten herausstellen, aber NICHT wortwörtlich wiederholen
// - Alle duzen sich!
const CATEGORY_PROMPTS: Record<string, string> = {
  hobbys: `Schreibe einen Kommentar zu Hobby-Gemeinsamkeiten.

KONTEXT: Die Original-Antworten stehen bereits in einer Tabelle daneben - du musst sie nicht wortwörtlich wiederholen.
AUFGABE: Hebe die Gemeinsamkeiten hervor und gib ggf. Vorschläge was man zusammen machen könnte.
DUZEN: Immer "ihr/euch" - niemals "Sie"
VERMEIDE: Wortwörtliche Wiederholungen, Emojis, "Person 1/2"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  freizeit: `Schreibe einen Kommentar zu Freizeit-Gemeinsamkeiten.

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben - nicht wortwörtlich wiederholen.
AUFGABE: Gemeinsamkeiten hervorheben, ggf. Vorschläge machen.
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  interessen: `Schreibe einen Kommentar zu gemeinsamen Interessen.

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben - nicht wortwörtlich wiederholen.
AUFGABE: Gemeinsamkeiten hervorheben, verbindende Elemente betonen.
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  sprachen: `Schreibe einen Kommentar zu Sprachkenntnissen.

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben.
AUFGABE: Beschreibe wie die Sprachen zusammenpassen und was das fürs Tandem bedeutet.
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  beruf: `Schreibe einen Kommentar zu beruflichen Verbindungen.

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben - nicht wortwörtlich wiederholen.
AUFGABE: Synergien und Verbindungspunkte hervorheben.
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  vorher: `Schreibe einen Kommentar zu bisherigen Erfahrungen.

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben - nicht wortwörtlich wiederholen.
AUFGABE: Verbindende Elemente und gemeinsame Erfahrungen hervorheben.
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  zukunft: `Schreibe einen Kommentar zu Zukunftsplänen.

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben - nicht wortwörtlich wiederholen.
AUFGABE: Beschreibe wie sich die Pläne ergänzen oder wie man sich unterstützen könnte.
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  tandem_motivation: `Schreibe einen Kommentar zur Tandem-Motivation.

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben - nicht wortwörtlich wiederholen.
AUFGABE: Beschreibe wie die Motivationen zusammenpassen.
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  freundschaft_werte: `Schreibe einen Kommentar zu Freundschafts-Werten.

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben - nicht wortwörtlich wiederholen.
AUFGABE: Die gemeinsame Wertebasis hervorheben.
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  events: `Schreibe einen Kommentar zu gemeinsamen Aktivitäten/Events.

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben - nicht wortwörtlich wiederholen.
AUFGABE: Gemeinsame Interessen hervorheben, konkrete Vorschläge machen.
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  verfuegbarkeit: `Schreibe einen Kommentar zur zeitlichen Verfügbarkeit.

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben.
AUFGABE: Beschreibe ob und wie die Zeiten zusammenpassen.
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar:`,

  default: `Schreibe einen Kommentar zur Frage "{Frage}".

KONTEXT: Die Original-Antworten stehen in der Tabelle daneben - nicht wortwörtlich wiederholen.
AUFGABE: Gemeinsamkeiten und Verbindungspunkte hervorheben.
DUZEN: "ihr/euch" - nie "Sie"
Falls keine Gemeinsamkeit erkennbar: antworte nur "---"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (oder "---" falls keine Gemeinsamkeit):`
};

// Detect category from question text
function detectCategory(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('hobby') || q.includes('hobbies') || q.includes('hobbys')) return 'hobbys';
  if (q.includes('freizeit') || q.includes('was machst du gerne')) return 'freizeit';
  if (q.includes('interesse') || q.includes('themen')) return 'interessen';
  if (q.includes('sprache') || q.includes('sprichst')) return 'sprachen';
  if (q.includes('beruf') || q.includes('arbeit') || q.includes('job') || q.includes('was machst du gerade')) return 'beruf';
  if (q.includes('vorher') || q.includes('früher') || q.includes('gelernt') || q.includes('was hast du')) return 'vorher';
  if (q.includes('zukunft') || q.includes('plan') || q.includes('ziel') || q.includes('vorhaben')) return 'zukunft';
  if (q.includes('warum') && (q.includes('swaf') || q.includes('tandem') || q.includes('mitmachen'))) return 'tandem_motivation';
  if (q.includes('wichtig') && (q.includes('freund') || q.includes('wert'))) return 'freundschaft_werte';
  if (q.includes('event') || q.includes('veranstaltung') || q.includes('unternehmen') || q.includes('aktivität')) return 'events';
  if (q.includes('zeit') || q.includes('wann') || q.includes('verfügbar') || q.includes('treffen') || q.includes('erreichbar')) return 'verfuegbarkeit';

  return 'default';
}

// Build prompt for a specific question
export function buildPrompt(question: string, answer1: string, answer2: string): string {
  const category = detectCategory(question);
  const template = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.default;

  return template
    .replace('{Frage}', question)
    .replace('{Antwort1}', answer1)
    .replace('{Antwort2}', answer2);
}

// Generate commonality text from two answers
export async function generateCommonality(
  question: string,
  answer1: string,
  answer2: string,
  modelName?: string
): Promise<string | null> {
  const model = modelName || await findBestModel();
  if (!model) return null;

  const prompt = buildPrompt(question, answer1, answer2);

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 400,
        },
      }),
    });

    if (!response.ok) {
      console.warn('Ollama API error:', response.status);
      return null;
    }

    const data = await response.json();
    const result = data.response?.trim() || null;

    // Skip if no commonality found
    if (!result || result === '---' || result.includes('keine Gemeinsamkeit') || result.includes('keine erkennbare')) {
      return null;
    }

    // Clean up the result - remove quotes if present
    return result.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.warn('Ollama generation failed:', error);
    return null;
  }
}

// Batch generate commonalities for multiple fields
export async function generateAllCommonalities(
  fields: Array<{ question: string; answer1: string; answer2: string }>,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const model = await findBestModel();

  if (!model) {
    console.warn('No Ollama model available');
    return results;
  }

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    onProgress?.(i + 1, fields.length);

    // Skip if either answer is empty
    if (!field.answer1 || !field.answer2) continue;

    const result = await generateCommonality(
      field.question,
      field.answer1,
      field.answer2,
      model
    );

    if (result) {
      results.set(field.question, result);
    }

    // Small delay to not overwhelm the model
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

// Get Ollama status info for UI
export async function getOllamaStatus(): Promise<{
  available: boolean;
  model: string | null;
  models: string[];
}> {
  const available = await isOllamaAvailable();
  if (!available) {
    return { available: false, model: null, models: [] };
  }

  const models = await getAvailableModels();
  const model = await findBestModel();

  return { available: true, model, models };
}
