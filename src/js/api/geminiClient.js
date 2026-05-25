import { GEMINI_ENDPOINT } from "../config/defaults.js";
import { readApiError } from "../utils/errors.js";
import { parseJsonFromText } from "../utils/json.js";

export async function generateGeminiJson({ apiKey, model, prompt }) {
  if (!apiKey) throw new Error("Gemini APIキーを設定してください。");
  const response = await fetch(`${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  if (!response.ok) throw new Error(await readApiError(response));
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  if (!text) throw new Error("Geminiから本文が返りませんでした。");
  return parseJsonFromText(text);
}
