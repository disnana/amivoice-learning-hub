export const NATIVE_LANGUAGES = ["日本語", "English", "한국어", "中文", "Español"];

export const TARGET_LANGUAGES = [
  { label: "英語", code: "en-US", ttsVoice: "en-US-Neural2-F" },
  { label: "日本語", code: "ja-JP", ttsVoice: "ja-JP-Neural2-B" },
  { label: "韓国語", code: "ko-KR", ttsVoice: "ko-KR-Neural2-A" },
  { label: "中国語", code: "cmn-CN", ttsVoice: "cmn-CN-Wavenet-A" },
  { label: "スペイン語", code: "es-ES", ttsVoice: "es-ES-Neural2-B" },
  { label: "フランス語", code: "fr-FR", ttsVoice: "fr-FR-Neural2-A" },
  { label: "ドイツ語", code: "de-DE", ttsVoice: "de-DE-Neural2-B" },
];

export function findTargetLanguage(label) {
  return TARGET_LANGUAGES.find((language) => language.label === label) || TARGET_LANGUAGES[0];
}
