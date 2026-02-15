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

// Generate commonality text from two answers
export async function generateCommonality(
  question: string,
  answer1: string,
  answer2: string,
  modelName?: string
): Promise<string | null> {
  const model = modelName || await findBestModel();
  if (!model) return null;

  const prompt = `Du bist ein freundlicher Tandem-Vermittler bei "Start with a Friend". Analysiere die folgenden zwei Antworten auf die Frage "${question}" und schreibe EINEN kurzen Satz (max. 20 Wörter) der die Gemeinsamkeit oder Verbindung beschreibt. Schreibe natürlich und persönlich, ohne Emojis, so als würdest du zwei Freunde einander vorstellen. Wenn es keine erkennbare Gemeinsamkeit gibt, antworte nur mit "---".

Person 1: "${answer1}"
Person 2: "${answer2}"

Gemeinsamkeit:`;

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
          num_predict: 60, // Max tokens
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
