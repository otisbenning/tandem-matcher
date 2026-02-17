// Ollama Service - LLM Integration for text generation
// Hosted at api.swaf.koeln - DSGVO-compliant (eigener Server)

import { getCustomPrompt } from './storage';

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
    console.log('Pruefe Ollama-Verfuegbarkeit...');
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      headers: getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    console.log(`Ollama Response: ${response.status} ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.warn('Ollama nicht erreichbar:', error);
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
const DEFAULT_MODEL = 'qwen2.5:14b';

// Find the best available model
export async function findBestModel(): Promise<string | null> {
  const available = await getAvailableModels();
  if (available.length === 0) {
    return DEFAULT_MODEL;
  }

  if (available.some(m => m.includes('qwen'))) {
    return available.find(m => m.includes('qwen')) || DEFAULT_MODEL;
  }

  return available[0] || DEFAULT_MODEL;
}

// Default prompt template - exported for Settings UI
export const DEFAULT_PROMPT = `Schreibe einen kurzen Kommentar (2-3 Saetze) zu den Gemeinsamkeiten zweier Personen bezueglich der gestellten Frage.

WICHTIG:
- NUR die Gemeinsamkeiten zur Frage beschreiben
- Beide als "ihr" ansprechen
- NIEMALS "Person A/B" schreiben
- KEINE Tipps zur Kontaktaufnahme oder Kommunikation
- KEINE Vorschlaege wie sie sich erreichen/treffen/austauschen koennen
- Keine Einleitung, kein Schlusssatz
- Kurz bleiben, nicht abschweifen

Frage: {Frage}
Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Gemeinsamkeiten:`;

// Correction prompt for fixing "Person A/B" references
const CORRECTION_PROMPT = `Der folgende Text enthaelt "Person A" oder "Person B". Schreibe den Text um, sodass beide Personen gemeinsam als "ihr" angesprochen werden. Behalte den Inhalt bei, entferne nur die "Person A/B" Formulierungen.

Original:
"{text}"

Umgeschriebener Text (ohne "Person A" oder "Person B"):`;

// Build prompt for a specific question
export function buildPrompt(question: string, answer1: string, answer2: string): string {
  const template = getCustomPrompt() || DEFAULT_PROMPT;

  return template
    .replace('{Frage}', question)
    .replace('{Antwort1}', answer1)
    .replace('{Antwort2}', answer2);
}

// Check if text contains "Person A" or "Person B"
function needsCorrection(text: string): boolean {
  const pattern = /Person\s*[AB]/i;
  return pattern.test(text);
}

// Send a request to Ollama
async function ollamaGenerate(model: string, prompt: string): Promise<string | null> {
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
          num_predict: 300,
        },
      }),
    });

    if (!response.ok) {
      console.warn('Ollama API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.response?.trim() || null;
  } catch (error) {
    console.warn('Ollama request failed:', error);
    return null;
  }
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
  let result = await ollamaGenerate(model, prompt);

  if (!result || result === '---' || result.includes('keine Gemeinsamkeit') || result.includes('keine erkennbare')) {
    return null;
  }

  // Auto-correction: If "Person A" or "Person B" appears, ask for correction
  if (needsCorrection(result)) {
    console.log('Korrektur noetig: "Person A/B" gefunden, sende Korrektur-Request...');
    const correctionPrompt = CORRECTION_PROMPT.replace('{text}', result);
    const corrected = await ollamaGenerate(model, correctionPrompt);
    
    if (corrected && !needsCorrection(corrected)) {
      console.log('Korrektur erfolgreich');
      result = corrected;
    } else {
      console.log('Korrektur fehlgeschlagen, verwende Original');
    }
  }

  return result.replace(/^["']|["']$/g, '').trim();
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
