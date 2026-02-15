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
const CATEGORY_PROMPTS: Record<string, string> = {
  hobbys: `Analysiere diese Hobby-Angaben und schreibe auf, was beide Personen gemeinsam haben – oder wie man die Hobbies verbinden kann. Möglichst ausführlich (200-300 Zeichen). Schreibe aktiv: "Ihr könnt…" Vermeide "Person 1 sagt das, Person 2 sagt das." Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  freizeit: `Analysiere diese Freizeit-Angaben und schreibe auf, was beide Personen gemeinsam haben – oder wie man die Freizeit gemeinsam gestalten kann. Möglichst ausführlich (200-300 Zeichen). Schreibe aktiv: "Ihr könnt…" Vermeide "Person 1 sagt das, Person 2 sagt das." Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  interessen: `Analysiere diese Interessen und schreibe auf, was beide Personen gemeinsam haben – oder wie man die Interessen gemeinsam gestalten kann. Möglichst ausführlich (200-300 Zeichen). Schreibe aktiv: "Ihr könnt…" Vermeide "Person 1 sagt das, Person 2 sagt das." Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  sprachen: `Analysiere diese Sprachkenntnisse und schreibe auf, wie die beiden miteinander kommunizieren können. Schreibe aktiv: "Ihr könnt…" Vermeide "Person 1 sagt das, Person 2 sagt das." Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  beruf: `Analysiere diese Berufs-/Arbeitsangaben und schreibe auf, was die Berufe/Arbeit der Personen gemeinsam haben. Oder warum Unterschiede spannend sein können. Schreibe aktiv: "Ihr könnt…" Vermeide "Person 1 sagt das, Person 2 sagt das." Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  vorher: `Analysiere diese Angaben zu früheren Tätigkeiten. Gehe kurz auf beide Geschichten ein. Sage, dass das spannend ist / interessant ist / der unterschiedliche oder gleiche Weg interessant ist. Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  zukunft: `Analysiere diese Zukunftspläne und schreibe, wie beide Personen voneinander profitieren könnten – basierend auf ihren Erfahrungen und Plänen. Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  tandem_motivation: `Analysiere diese Motivationen für das Tandem-Programm und schreibe, warum sich die Motivationen gut ergänzen. Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  freundschaft_werte: `Analysiere diese Angaben zu wichtigen Werten in einer Freundschaft und schreibe, warum sich die Vorstellungen gut ergänzen. Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  events: `Analysiere diese Event-/Aktivitäten-Angaben und schreibe auf, was beide Personen gemeinsam haben – oder wie man Events/Aktivitäten gemeinsam gestalten kann. Möglichst ausführlich (200-300 Zeichen). Schreibe aktiv: "Ihr könnt…" Vermeide "Person 1 sagt das, Person 2 sagt das." Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  verfuegbarkeit: `Analysiere diese Verfügbarkeits-Angaben und mache einen konkreten Vorschlag für ein erstes Treffen – einen ersten Termin (kein Datum, aber Wochentag/Tageszeit basierend auf den Überschneidungen). Keine Emojis.

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`,

  default: `Du bist ein freundlicher Tandem-Vermittler bei "Start with a Friend". Analysiere die folgenden zwei Antworten auf die Frage "{Frage}" und schreibe einen kurzen Text (100-200 Zeichen) der die Gemeinsamkeit oder Verbindung beschreibt. Schreibe natürlich und persönlich, ohne Emojis. Wenn es keine erkennbare Gemeinsamkeit gibt, antworte nur mit "---".

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Antwort:`
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
          num_predict: 150, // Max tokens (increased for longer responses)
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
