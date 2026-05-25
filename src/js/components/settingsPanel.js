import { AMIVOICE_ENGINES, GEMINI_MODELS } from "../data/models.js";
import { NATIVE_LANGUAGES } from "../data/languages.js";
import { el, icon } from "../utils/dom.js";
import { checkboxField, inputField, selectField, textareaField } from "./field.js";

export function SettingsPanel(settings, handlers) {
  const provider = settings.ttsProvider;
  const selectedGeminiModel = GEMINI_MODELS.includes(settings.geminiModel) ? settings.geminiModel : "custom";
  return el("aside", { class: "panel p-4 space-y-4" }, [
    el("div", { class: "flex items-start justify-between gap-3" }, [
      el("div", {}, [
        el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: "Setup" }),
        el("h1", { class: "text-2xl font-black", text: "PhrasePilot" }),
      ]),
      el("span", { class: "status-pill" }, [document.createRange().createContextualFragment(`${icon("key-round")} BYO API`)]),
    ]),
    selectField({
      id: "nativeLanguage",
      label: "母国語",
      value: settings.nativeLanguage,
      options: NATIVE_LANGUAGES,
    }),
    selectField({
      id: "geminiModel",
      label: "Geminiモデル",
      value: selectedGeminiModel,
      options: [
        ...GEMINI_MODELS.map((model) => ({ value: model, label: model })),
        { value: "custom", label: "カスタム" },
      ],
    }),
    inputField({
      id: "geminiModelCustom",
      label: "Geminiモデル カスタム",
      value: selectedGeminiModel === "custom" ? settings.geminiModel : "",
      placeholder: "例: gemini-flash-latest",
    }),
    inputField({
      id: "geminiApiKey",
      label: "Gemini APIキー",
      value: settings.geminiApiKey,
      type: "password",
      placeholder: "AIza...",
    }),
    el("div", { class: "segmented", role: "tablist" }, [
      el("button", {
        class: `segment ${provider === "browser" ? "is-active" : ""}`,
        type: "button",
        onclick: () => handlers.onTtsProvider("browser"),
        text: "内蔵TTS",
      }),
      el("button", {
        class: `segment ${provider === "google" ? "is-active" : ""}`,
        type: "button",
        onclick: () => handlers.onTtsProvider("google"),
        text: "Google TTS",
      }),
    ]),
    inputField({
      id: "googleTtsApiKey",
      label: "Google TTS APIキー",
      value: settings.googleTtsApiKey,
      type: "password",
      placeholder: "ブラウザ直叩きが通る場合に使用",
    }),
    inputField({
      id: "ttsVoiceName",
      label: "Google TTS voice name",
      value: settings.ttsVoiceName,
      placeholder: "空なら言語ごとの既定音声",
    }),
    inputField({
      id: "amivoiceApiKey",
      label: "AmiVoice APIキー authorization",
      value: settings.amivoiceApiKey,
      type: "password",
      placeholder: "APPKEY",
    }),
    selectField({
      id: "amivoiceEnginePreset",
      label: "AmiVoiceエンジン",
      value: AMIVOICE_ENGINES.some((engine) => engine.value === settings.amivoiceEngine)
        ? settings.amivoiceEngine
        : "custom",
      options: AMIVOICE_ENGINES,
    }),
    inputField({
      id: "amivoiceEngine",
      label: "AmiVoice engine value",
      value: settings.amivoiceEngine,
      placeholder: "-a-general",
    }),
    checkboxField({
      id: "amivoiceLoggingOptOut",
      label: "AmiVoiceのログ保存をオプトアウトする",
      checked: settings.amivoiceLoggingOptOut,
      help: "オンなら loggingOptOut=True。オフなら料金が安くなる場合があります。",
    }),
    checkboxField({
      id: "amivoiceUseRawParams",
      label: "AmiVoice dパラメータを直接指定する",
      checked: settings.amivoiceUseRawParams,
      help: "オンなら下の文字列をそのまま送ります。",
    }),
    textareaField({
      id: "amivoiceRawParams",
      label: "AmiVoice dパラメータ",
      value: settings.amivoiceRawParams,
      placeholder: "grammarFileNames=-a-general loggingOptOut=True",
      rows: 3,
    }),
    textareaField({
      id: "amivoiceProfileWords",
      label: "ユーザー辞書メモ",
      value: settings.amivoiceProfileWords,
      placeholder: "Alpha alfa\nBravo bravo\nrunway runway",
      rows: 4,
    }),
    el("button", {
      class: "button button-primary w-full",
      type: "button",
      onclick: handlers.onSave,
    }, [document.createRange().createContextualFragment(`${icon("save")} 保存`)]),
  ]);
}
