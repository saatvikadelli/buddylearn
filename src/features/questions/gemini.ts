/**
 * Gemini client. PROTOTYPE ONLY: the key ships inside the app, so anyone can extract it.
 * Fine on the free tier (no billing = no bill). Before you enable billing, move this call
 * to a server (Supabase Edge Function etc.) and make generateJson() call that instead.
 * Nothing else in the app needs to change.
 *
 * .env (in the project root, and listed in .gitignore):
 *   EXPO_PUBLIC_GEMINI_API_KEY=...        from aistudio.google.com
 *   EXPO_PUBLIC_GEMINI_MODEL=...          a Flash model name from AI Studio's model list
 * Restart `expo start` after editing .env.
 */
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
/**
 * One model, or several separated by commas: the first is tried first, and the next ones are
 * used when it is busy (503) or limited (429). Example: gemini-3.8-flash,gemini-3.5-flash-lite
 */
const MODELS = (process.env.EXPO_PUBLIC_GEMINI_MODEL ?? "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/** Models that rejected the thinking-level setting (found at runtime). */
const noThinkingSetting = new Set<string>();

/** Busy or out of quota: worth trying the next model. */
const TRY_NEXT = new Set([429, 500, 503]);

export class GeminiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
  }
}

type GenerateJsonInput = {
  system: string;
  prompt: string;
  /** Gemini responseSchema (OpenAPI subset: OBJECT, ARRAY, STRING, INTEGER...). */
  schema: object;
  temperature?: number;
  signal?: AbortSignal;
};

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
};

export async function generateJson<T>({
  system,
  prompt,
  schema,
  temperature = 0.7,
  signal,
}: GenerateJsonInput): Promise<T> {
  if (!API_KEY || MODELS.length === 0) {
    throw new GeminiError(
      "Missing EXPO_PUBLIC_GEMINI_API_KEY or EXPO_PUBLIC_GEMINI_MODEL in .env. Add them and restart Expo.",
    );
  }

  const bodyFor = (lowThinking: boolean) =>
    JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
        responseSchema: schema,
        // Writing short questions needs little reasoning; low thinking is much faster.
        ...(lowThinking ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
      },
    });

  const send = async (model: string) => {
    const call = (lowThinking: boolean) =>
      fetch(`${BASE}/${model}:generateContent`, {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
        body: bodyFor(lowThinking),
      });
    if (noThinkingSetting.has(model)) return call(false);
    const first = await call(true);
    // Some models do not accept a thinking level: remember that and ask again without it.
    if (first.status === 400) {
      const text = await first.clone().text();
      if (/thinking/i.test(text)) {
        noThinkingSetting.add(model);
        if (__DEV__) console.log(`[questions] ${model} does not take a thinking level, retrying without`);
        return call(false);
      }
    }
    return first;
  };

  let res: Response | null = null;
  for (const [i, model] of MODELS.entries()) {
    res = await send(model);
    if (res.ok || !TRY_NEXT.has(res.status) || i === MODELS.length - 1) break;
    if (__DEV__) console.log(`[questions] ${model} busy (${res.status}), trying ${MODELS[i + 1]}`);
  }
  if (!res) throw new GeminiError("No model was tried.");

  if (res.status === 429) throw new GeminiError("Free limit reached. Wait a minute and try again.", 429);
  if (!res.ok) throw new GeminiError(`Gemini error ${res.status}: ${await res.text()}`, res.status);

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) {
    const reason = data.promptFeedback?.blockReason ?? data.candidates?.[0]?.finishReason ?? "unknown";
    throw new GeminiError(`Gemini returned no text (reason: ${reason}).`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GeminiError("Gemini did not return valid JSON.");
  }
}