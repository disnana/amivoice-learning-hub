import { AMIVOICE_ENGINES, GEMINI_MODELS } from "../data/models.js";
import { NATIVE_LANGUAGES } from "../data/languages.js";
import { el, icon } from "../utils/dom.js";
import { checkboxField, inputField, selectField, textareaField } from "./field.js";

export function SettingsPanel(settings, handlers) {
  const provider = settings.ttsProvider;
  const selectedGeminiModel = settings.geminiModelMode === "custom" || !GEMINI_MODELS.includes(settings.geminiModel)
    ? "custom"
    : settings.geminiModel;
  const selectedAmiVoiceEngine = settings.amivoiceEngineMode === "custom" || !AMIVOICE_ENGINES.some((engine) => engine.value === settings.amivoiceEngine)
    ? "custom"
    : settings.amivoiceEngine;
  return el("aside", { class: "settings-form" }, [
    el("span", { class: "status-pill settings-badge" }, [document.createRange().createContextualFragment(`${icon("key-round")} BYO API`)]),
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
    selectedGeminiModel === "custom" ? inputField({
      id: "geminiModelCustom",
      label: "Geminiモデル カスタム",
      value: settings.geminiModel,
      placeholder: "例: gemini-flash-latest",
    }) : document.createTextNode(""),
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
    provider === "google" ? inputField({
      id: "googleTtsApiKey",
      label: "Google TTS APIキー",
      value: settings.googleTtsApiKey,
      type: "password",
      placeholder: "ブラウザ直叩きが通る場合に使用",
    }) : document.createTextNode(""),
    provider === "google" ? inputField({
      id: "ttsVoiceName",
      label: "Google TTS voice name",
      value: settings.ttsVoiceName,
      placeholder: "空なら言語ごとの既定音声",
    }) : document.createTextNode(""),
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
      value: selectedAmiVoiceEngine,
      options: AMIVOICE_ENGINES,
    }),
    selectedAmiVoiceEngine === "custom" ? inputField({
      id: "amivoiceEngine",
      label: "AmiVoice engine value",
      value: settings.amivoiceEngine,
      placeholder: "-a-general",
    }) : document.createTextNode(""),
    el("details", { class: "settings-advanced settings-wide" }, [
      el("summary", { text: "AmiVoice詳細" }),
      el("div", { class: "settings-advanced-grid" }, [
        checkboxField({
          id: "amivoiceLoggingOptOut",
          label: "ログ保存をオプトアウト",
          checked: settings.amivoiceLoggingOptOut,
          help: "オンなら loggingOptOut=True。",
        }),
        checkboxField({
          id: "amivoiceUseRawParams",
          label: "dパラメータ直接指定",
          checked: settings.amivoiceUseRawParams,
          help: "オンなら下の文字列をそのまま送ります。",
        }),
        settings.amivoiceUseRawParams ? textareaField({
          id: "amivoiceRawParams",
          label: "AmiVoice dパラメータ",
          value: settings.amivoiceRawParams,
          placeholder: "grammarFileNames=-a2b-multi-general loggingOptOut=True",
          rows: 2,
        }) : document.createTextNode(""),
        checkboxField({
          id: "amivoiceUseProfileWords",
          label: "ユーザー辞書を使う",
          checked: settings.amivoiceUseProfileWords,
          help: "オンなら profileWords を送ります。",
        }),
        settings.amivoiceUseProfileWords ? textareaField({
          id: "amivoiceProfileWords",
          label: "AmiVoice profileWords",
          value: settings.amivoiceProfileWords,
          placeholder: "Alpha alfa\nBravo bravo\nrunway runway",
          rows: 2,
        }) : document.createTextNode(""),
      ]),
    ]),
    el("div", { class: "settings-actions settings-wide" }, [
      el("button", {
        class: "button button-primary",
        type: "button",
        onclick: handlers.onSave,
      }, [document.createRange().createContextualFragment(`${icon("save")} 保存`)]),
    ]),
  ].map((node) => {
    if (node.nodeType === Node.TEXT_NODE) return node;
    if (node.querySelector?.("#geminiModel")) node.querySelector("#geminiModel").addEventListener("change", handlers.onOptionChange);
    if (node.querySelector?.("#amivoiceEnginePreset")) node.querySelector("#amivoiceEnginePreset").addEventListener("change", handlers.onOptionChange);
    if (node.querySelector?.("#amivoiceUseRawParams")) node.querySelector("#amivoiceUseRawParams").addEventListener("change", handlers.onOptionChange);
    if (node.querySelector?.("#amivoiceUseProfileWords")) node.querySelector("#amivoiceUseProfileWords").addEventListener("change", handlers.onOptionChange);
    return node;
  }));
}
