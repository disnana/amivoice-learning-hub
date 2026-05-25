import { GOOGLE_TTS_ENDPOINT } from "../config/defaults.js";
import { findTargetLanguage } from "../data/languages.js";
import { base64ToBlob } from "../utils/audio.js";
import { readApiError } from "../utils/errors.js";

function getVoiceForModel(langCode, modelType) {
  if (!modelType || modelType === "default" || modelType === "custom") return null;
  const base = langCode; // e.g. "ja-JP"
  
  if (modelType === "Standard") {
    return `${base}-Standard-A`;
  }
  if (modelType === "Wavenet") {
    return `${base}-Wavenet-A`;
  }
  if (modelType === "Neural2") {
    if (base === "ja-JP") return "ja-JP-Neural2-B";
    if (base === "en-US") return "en-US-Neural2-F";
    return `${base}-Neural2-A`;
  }
  if (modelType === "Studio") {
    if (base === "en-US") return "en-US-Studio-O";
    if (base === "ja-JP") return "ja-JP-Neural2-B"; // studio unavailable for ja-JP
    return `${base}-Neural2-A`;
  }
  if (modelType === "Chirp") {
    return `${base}-Chirp3-HD-A`;
  }
  return null;
}

export async function synthesizeWithGoogleTts({ apiKey, text, targetLanguage, googleTtsModelType, voiceName, speakingRate, pitch }) {
  if (!apiKey) throw new Error("Google TTS APIキーを設定してください。");
  const language = findTargetLanguage(targetLanguage);
  
  let resolvedVoiceName = voiceName;
  if (googleTtsModelType && googleTtsModelType !== "custom") {
    resolvedVoiceName = getVoiceForModel(language.code, googleTtsModelType);
  }
  const finalVoiceName = resolvedVoiceName || language.ttsVoice;

  const response = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: language.code,
        name: finalVoiceName,
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

export function speakWithBrowser({ text, targetLanguage, speakingRate, onEnd }) {
  window.speechSynthesis.cancel();
  const language = findTargetLanguage(targetLanguage);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language.code;
  utterance.rate = Number(speakingRate) || 0.86;
  if (typeof onEnd === "function") {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }
  window.speechSynthesis.speak(utterance);
}
