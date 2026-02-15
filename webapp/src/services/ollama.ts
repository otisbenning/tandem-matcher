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
// WICHTIG: Niemals "Person 1" oder "Person 2" schreiben! Immer direkt "Ihr" verwenden.
const CATEGORY_PROMPTS: Record<string, string> = {
  hobbys: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Hobby-Angaben und schreibe, was beide gemeinsam haben oder wie sie die Hobbies verbinden können.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "gemeinsam"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- NIEMALS "Die erste Person" oder "Die zweite Person"!
- Keine Emojis
- Locker und freundlich, nicht förmlich

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  freizeit: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Freizeit-Angaben und schreibe, was beide gemeinsam machen können.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "gemeinsam"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis
- Locker und freundlich

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  interessen: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Interessen und schreibe, was beide verbindet.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "gemeinsam"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis
- Locker und freundlich

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  sprachen: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Sprachkenntnisse und schreibe, wie beide miteinander kommunizieren können.

REGELN:
- Schreibe 2-3 Sätze (100-200 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  beruf: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Berufs-Angaben und schreibe, was beide beruflich verbindet oder warum die Unterschiede spannend sind.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis
- Locker und freundlich

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  vorher: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Angaben zu früheren Tätigkeiten und schreibe, was beide verbindet oder warum die unterschiedlichen Wege interessant sind.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euer Weg", "eure Erfahrungen"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  zukunft: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Zukunftspläne und schreibe, wie beide voneinander profitieren können.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "eure Pläne", "gemeinsam"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  tandem_motivation: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Motivationen fürs Tandem-Programm und schreibe, warum sich die Motivationen gut ergänzen.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "eure Motivation"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  freundschaft_werte: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Werte-Angaben und schreibe, warum sich die Vorstellungen gut ergänzen.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "euch beiden"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  events: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Event-/Aktivitäten-Angaben und schreibe, was beide gemeinsam unternehmen können.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr könnt", "gemeinsam", "zusammen"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  verfuegbarkeit: `Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Verfügbarkeits-Angaben und mache einen konkreten Vorschlag für ein erstes Treffen.

REGELN:
- Schreibe 2-3 Sätze mit einem konkreten Zeitvorschlag (Wochentag/Tageszeit)
- Sprich beide direkt an mit "Ihr könntet", "euer erstes Treffen"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,

  default: `Du schreibst einen freundlichen Text für zwei Tandem-Partner bei "Start with a Friend". Analysiere die Antworten zur Frage "{Frage}" und schreibe, was beide verbindet.

REGELN:
- Schreibe 1-2 Sätze (100-200 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "gemeinsam"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis
- Wenn keine Gemeinsamkeit erkennbar: antworte nur "---"

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`
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
