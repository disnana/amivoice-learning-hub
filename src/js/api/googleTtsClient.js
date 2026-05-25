import { GOOGLE_TTS_ENDPOINT } from "../config/defaults.js";
import { findTargetLanguage } from "../data/languages.js";
import { base64ToBlob } from "../utils/audio.js";
import { readApiError } from "../utils/errors.js";

export async function synthesizeWithGoogleTts({ apiKey, text, targetLanguage, voiceName, speakingRate, pitch }) {
  if (!apiKey) throw new Error("Google TTS APIキーを設定してください。");
  const language = findTargetLanguage(targetLanguage);
  const response = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: language.code,
        name: voiceName || language.ttsVoice,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: Number(speakingRate) || 0.86,
        pitch: Number(pitch) || 0,
      },
    }),
  });

  if (!response.ok) throw new Error(await readApiError(response));
  const payload = await response.json();
  const blob = base64ToBlob(payload.audioContent, "audio/mpeg");
  return URL.createObjectURL(blob);
}

export function speakWithBrowser({ text, targetLanguage, speakingRate }) {
  window.speechSynthesis.cancel();
  const language = findTargetLanguage(targetLanguage);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language.code;
  utterance.rate = Number(speakingRate) || 0.86;
  window.speechSynthesis.speak(utterance);
}
