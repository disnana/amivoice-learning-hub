export const STORAGE_KEY = "phrasepilot.settings.v1";
export const HISTORY_KEY = "phrasepilot.history.v1";

export const DEFAULT_SETTINGS = {
  nativeLanguage: "日本語",
  targetLanguage: "英語",
  useCase: "daily",
  customUseCase: "",
  lessonCount: 3,
  lessonCountMode: "3",
  geminiApiKey: "",
  googleTtsApiKey: "",
  amivoiceApiKey: "",
  geminiModel: "gemini-flash-latest",
  geminiModelMode: "preset",
  ttsProvider: "browser",
  ttsVoiceName: "",
  ttsSpeakingRate: 0.86,
  ttsPitch: 0,
  amivoiceEngine: "-a2b-multi-general",
  amivoiceEngineMode: "preset",
  amivoiceLoggingOptOut: true,
  amivoiceUseRawParams: false,
  amivoiceRawParams: "grammarFileNames=-a2b-multi-general loggingOptOut=True",
  amivoiceUseProfileWords: false,
  amivoiceProfileWords: "",
  amivoicePollIntervalMs: 3000,
};

export const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
export const GOOGLE_TTS_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";
export const AMIVOICE_ASYNC_ENDPOINT = "https://acp-api-async.amivoice.com/v2/recognitions";
