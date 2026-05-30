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
    el("div", { class: "settings-wide panel-muted text-[11px] space-y-1.5 p-2.5 rounded border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 mb-2" }, [
      el("p", { class: "font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1" }, [
        document.createRange().createContextualFragment(`${icon("help-circle")} 🔑 APIキーの取得ガイド`)
      ]),
      el("ul", { class: "list-disc list-inside space-y-1.5 text-[10.5px] leading-relaxed" }, [
        el("li", {}, [
          document.createTextNode("Gemini APIキー: "),
          el("a", { href: "https://aistudio.google.com/api-keys", target: "_blank", class: "text-[var(--blue)] hover:underline font-medium", text: "Google AI Studio" }),
          document.createTextNode(" から無料で作成できます。")
        ]),
        el("li", {}, [
          document.createTextNode("AmiVoice APIキー: "),
          el("a", { href: "https://acp.amivoice.com/", target: "_blank", class: "text-[var(--blue)] hover:underline font-medium", text: "AmiVoice Cloud Platform" }),
          document.createTextNode(" から会員登録して取得（毎月無料枠あり）。")
        ]),
        el("li", {}, [
          document.createTextNode("Google TTS: "),
          el("a", { href: "https://console.cloud.google.com/", target: "_blank", class: "text-[var(--blue)] hover:underline font-medium", text: "Google Cloud Console" }),
          document.createTextNode(" から「Text-to-Speech API」を有効化してキーを取得してください。")
        ])
      ])
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
    provider === "google" ? selectField({
      id: "googleTtsModelType",
      label: "音声モデル (料金クラス)",
      value: settings.googleTtsModelType || "default",
      options: [
        { value: "default", label: "デフォルト (言語の既定値)" },
        { value: "Standard", label: "標準音声 (Standard - 月400万字無料)" },
        { value: "Wavenet", label: "WaveNet (WaveNet - 月400万字無料)" },
        { value: "Neural2", label: "Neural2 (Neural2 - 月100万字無料)" },
        { value: "Chirp", label: "Chirp 3: HD (Chirp - 月100万字無料)" },
        { value: "Studio", label: "スタジオ音声 (Studio - 月100万字無料)" },
        { value: "custom", label: "カスタム (直接ボイス名指定)" },
      ],
    }) : document.createTextNode(""),
    provider === "google" && settings.googleTtsModelType === "custom" ? inputField({
      id: "ttsVoiceName",
      label: "Google TTS voice name (直接指定)",
      value: settings.ttsVoiceName || "",
      placeholder: "例: ja-JP-Neural2-B",
    }) : document.createTextNode(""),
    provider === "google" ? el("div", { class: "panel-muted text-[10px] space-y-1 p-2 rounded border border-slate-100" }, [
      el("p", { class: "font-bold text-slate-600 dark:text-slate-300", text: "💡 Google Cloud TTS 料金と無料枠/月" }),
      el("div", { class: "grid grid-cols-2 gap-x-2 text-slate-500" }, [
        el("span", { text: "標準 / WaveNet:" }), el("span", { class: "text-right font-semibold", text: "400万字無料 (超過 $4/M)" }),
        el("span", { text: "Neural2:" }), el("span", { class: "text-right font-semibold", text: "100万字無料 (超過 $16/M)" }),
        el("span", { text: "Chirp (HD):" }), el("span", { class: "text-right font-semibold", text: "100万字無料 (超過 $30/M)" }),
        el("span", { text: "Studio (高品質):" }), el("span", { class: "text-right font-semibold", text: "100万字無料 (超過 $160/M)" }),
      ])
    ]) : document.createTextNode(""),
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
    el("details", {
      id: "amivoiceDetails",
      class: "settings-advanced settings-wide",
      open: settings.amivoiceDetailsOpen || false,
    }, [
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
