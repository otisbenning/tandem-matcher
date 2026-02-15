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
// WICHTIG: Aus Sicht des VERMITTLERS schreiben, der die Gemeinsamkeiten beschreibt!
const CATEGORY_PROMPTS: Record<string, string> = {
  hobbys: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Du schreibst eine E-Mail an zwei Personen, die du als Tandem zusammenbringen möchtest. Beschreibe ihre Hobby-Gemeinsamkeiten.

DEINE ROLLE: Du bist der Vermittler, der die beiden vorstellt.
SCHREIBSTIL: Beschreibe von außen, was beide gemeinsam haben.

BEISPIELE für guten Stil:
- "Ihr beide interessiert euch für Sport und Fitness."
- "Kochen ist eine Leidenschaft, die ihr teilt."
- "Ihr könntet zusammen wandern gehen."

VERMEIDE:
- Schreibe NICHT aus Sicht der Tandem-Partner selbst
- Keine Ich-Form, keine Wir-Form aus Sicht der Partner
- NIEMALS "Person 1" oder "Person 2"
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Gemeinsamkeit (2-3 Sätze):`,

  freizeit: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Beschreibe die Freizeit-Gemeinsamkeiten zweier Personen, die du zusammenbringen möchtest.

DEINE ROLLE: Du beschreibst von außen, was beide verbindet.

BEISPIELE für guten Stil:
- "In eurer Freizeit macht ihr beide gerne..."
- "Ihr könntet gemeinsam..."
- "Das verbindet euch: ..."

VERMEIDE: Ich-Form, Wir-Form aus Partnersicht, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Gemeinsamkeit (2-3 Sätze):`,

  interessen: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Beschreibe die gemeinsamen Interessen zweier Personen.

DEINE ROLLE: Du beschreibst von außen, was beide interessiert.

BEISPIELE: "Ihr interessiert euch beide für...", "Ein gemeinsames Interesse ist..."

VERMEIDE: Ich-Form, Wir-Form aus Partnersicht, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Gemeinsamkeit (2-3 Sätze):`,

  sprachen: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Beschreibe, welche Sprachen beide sprechen und wie sie kommunizieren können.

DEINE ROLLE: Du beschreibst die sprachliche Basis für das Tandem.

BEISPIELE: "Ihr sprecht beide Deutsch und Englisch.", "Deutsch könnt ihr gemeinsam üben."

VERMEIDE: Ich-Form aus Partnersicht (wie "Ich spreche..."), "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Sprachliche Basis (1-2 Sätze):`,

  beruf: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Beschreibe berufliche Gemeinsamkeiten oder interessante Unterschiede.

DEINE ROLLE: Du beschreibst von außen die beruflichen Hintergründe.

BEISPIELE: "Beruflich seid ihr beide im sozialen Bereich.", "Eure unterschiedlichen Branchen könnten für spannende Gespräche sorgen."

VERMEIDE: Ich-Form aus Partnersicht, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Berufliche Verbindung (2-3 Sätze):`,

  vorher: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Beschreibe die bisherigen Erfahrungen und Wege beider Personen.

DEINE ROLLE: Du beschreibst von außen die Lebensgeschichten.

BEISPIELE: "Ihr habt beide schon viel erlebt.", "Eure unterschiedlichen Wege machen das Tandem interessant."

VERMEIDE: Ich-Form aus Partnersicht, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Verbindung (2-3 Sätze):`,

  zukunft: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Beschreibe die Zukunftspläne und wie beide voneinander profitieren könnten.

DEINE ROLLE: Du beschreibst von außen die Ziele und Synergien.

BEISPIELE: "Ihr habt beide Pläne für...", "Dabei könntet ihr euch gegenseitig unterstützen."

VERMEIDE: Ich-Form aus Partnersicht, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Zukunftsperspektive (2-3 Sätze):`,

  tandem_motivation: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Beschreibe, warum die Motivationen beider gut zusammenpassen.

DEINE ROLLE: Du erklärst, warum dieses Match gut ist.

BEISPIELE: "Eure Motivationen ergänzen sich gut:", "Ihr wollt beide..."

VERMEIDE: Ich-Form aus Partnersicht, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Motivation (2-3 Sätze):`,

  freundschaft_werte: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Beschreibe die gemeinsamen Werte in Bezug auf Freundschaft.

DEINE ROLLE: Du beschreibst von außen, was beiden wichtig ist.

BEISPIELE: "Euch beiden ist wichtig:", "Ihr teilt ähnliche Werte wie..."

VERMEIDE: Ich-Form aus Partnersicht, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Gemeinsame Werte (2-3 Sätze):`,

  events: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Beschreibe, welche Events oder Aktivitäten beide gemeinsam machen könnten.

DEINE ROLLE: Du machst Vorschläge für gemeinsame Unternehmungen.

BEISPIELE: "Ihr könntet zusammen...", "Events wie ... interessieren euch beide."

VERMEIDE: Ich-Form aus Partnersicht, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Aktivitäts-Vorschläge (2-3 Sätze):`,

  verfuegbarkeit: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Analysiere die Verfügbarkeit und schlage einen passenden Zeitpunkt fürs erste Treffen vor.

DEINE ROLLE: Du findest eine gemeinsame Zeit.

BEISPIELE: "Ihr seid beide abends verfügbar.", "Ein Treffen am Wochenende würde gut passen."

VERMEIDE: Ich-Form aus Partnersicht, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Zeitvorschlag (1-2 Sätze):`,

  default: `Du bist ein Tandem-Vermittler bei "Start with a Friend". Beschreibe die Gemeinsamkeit zur Frage "{Frage}".

DEINE ROLLE: Du beschreibst von außen, was beide verbindet.
SCHREIBSTIL: "Ihr beide...", "Euch verbindet...", "Gemeinsam könntet ihr..."

VERMEIDE: Ich-Form aus Partnersicht, "Person 1/2", Emojis
Falls keine Gemeinsamkeit: antworte nur "---"

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Gemeinsamkeit (1-2 Sätze):`
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
          num_predict: 400, // Max tokens for full responses
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
