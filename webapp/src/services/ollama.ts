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
// Nur ein Abschnitt einer größeren E-Mail - keine Anrede/Abschluss nötig!
const CATEGORY_PROMPTS: Record<string, string> = {
  hobbys: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail. Dieser Abschnitt beschreibt die Hobby-Gemeinsamkeiten zweier Tandem-Partner.

WICHTIG: Du schreibst NUR einen Abschnitt, NICHT die ganze E-Mail!
- KEINE Anrede ("Hallo", "Liebe...")
- KEINE Einleitung ("Ich freue mich...", "Hier ist...")
- KEIN Abschluss ("Viele Grüße", "Ich hoffe...")
- Starte direkt mit dem Inhalt!

DEINE ROLLE: Vermittler, der von außen beschreibt.
STIL: "Ihr beide...", "Gemeinsam könntet ihr...", "Euch verbindet..."

VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze, direkt starten):`,

  freizeit: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Freizeit-Gemeinsamkeiten.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr beide...", "Gemeinsam könntet ihr...", "In eurer Freizeit..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,

  interessen: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über gemeinsame Interessen.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr interessiert euch beide für...", "Ein gemeinsames Interesse..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,

  sprachen: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Sprachkenntnisse.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr sprecht beide...", "Deutsch könnt ihr gemeinsam üben."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (1-2 Sätze):`,

  beruf: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über berufliche Verbindungen.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Beruflich verbindet euch...", "Eure unterschiedlichen Branchen..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,

  vorher: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über bisherige Erfahrungen.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr habt beide...", "Eure unterschiedlichen Wege..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,

  zukunft: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Zukunftspläne.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr habt beide Pläne für...", "Dabei könntet ihr euch unterstützen."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,

  tandem_motivation: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über die Tandem-Motivation.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Eure Motivationen ergänzen sich...", "Ihr wollt beide..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,

  freundschaft_werte: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Freundschafts-Werte.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Euch beiden ist wichtig...", "Ihr teilt ähnliche Werte..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,

  events: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über gemeinsame Aktivitäten.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr könntet zusammen...", "Events wie ... interessieren euch beide."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,

  verfuegbarkeit: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über die zeitliche Verfügbarkeit.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr seid beide abends verfügbar.", "Ein Treffen am Wochenende würde passen."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (1-2 Sätze):`,

  default: `Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail zur Frage "{Frage}".

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr beide...", "Euch verbindet...", "Gemeinsam könntet ihr..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis
Falls keine Gemeinsamkeit: antworte nur "---"

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (1-2 Sätze):`
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
