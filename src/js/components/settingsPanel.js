import { AMIVOICE_ENGINES, GEMINI_MODELS } from "../data/models.js";
import { NATIVE_LANGUAGES } from "../data/languages.js";
import { el, icon } from "../utils/dom.js";
import { checkboxField, inputField, selectField, textareaField } from "./field.js";

export function SettingsPanel(settings, handlers) {
  const provider = settings.ttsProvider || "browser";
  const selectedGeminiModel = settings.geminiModelMode === "custom" || !GEMINI_MODELS.includes(settings.geminiModel)
    ? "custom"
    : settings.geminiModel;
  const selectedAmiVoiceEngine = settings.amivoiceEngineMode === "custom" || !AMIVOICE_ENGINES.some((engine) => engine.value === settings.amivoiceEngine)
    ? "custom"
    : settings.amivoiceEngine;

  // 1. 各フィールドをあらかじめ生成し、IDと初期表示を設定する

  const nativeLanguageField = selectField({
    id: "nativeLanguage",
    label: "母国語",
    value: settings.nativeLanguage,
    options: NATIVE_LANGUAGES,
  });

  const geminiModelField = selectField({
    id: "geminiModel",
    label: "Geminiモデル",
    value: selectedGeminiModel,
    options: [
      ...GEMINI_MODELS.map((model) => ({ value: model, label: model })),
      { value: "custom", label: "カスタム" },
    ],
  });

  const geminiModelCustomField = inputField({
    id: "geminiModelCustom",
    label: "Geminiモデル カスタム",
    value: settings.geminiModel,
    placeholder: "例: gemini-flash-latest",
  });
  geminiModelCustomField.id = "geminiModelCustom-wrapper";
  if (selectedGeminiModel !== "custom") geminiModelCustomField.classList.add("hidden");

  const geminiApiKeyField = inputField({
    id: "geminiApiKey",
    label: "Gemini APIキー",
    value: settings.geminiApiKey,
    type: "password",
    placeholder: "AIza...",
  });

  const googleTtsApiKeyField = inputField({
    id: "googleTtsApiKey",
    label: "Google TTS APIキー",
    value: settings.googleTtsApiKey,
    type: "password",
    placeholder: "ブラウザ直叩きが通る場合に使用",
  });
  googleTtsApiKeyField.id = "googleTtsApiKey-wrapper";
  if (provider !== "google") googleTtsApiKeyField.classList.add("hidden");

  const googleTtsModelTypeField = selectField({
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
  });
  googleTtsModelTypeField.id = "googleTtsModelType-wrapper";
  if (provider !== "google") googleTtsModelTypeField.classList.add("hidden");

  const ttsVoiceNameField = inputField({
    id: "ttsVoiceName",
    label: "Google TTS voice name (直接指定)",
    value: settings.ttsVoiceName || "",
    placeholder: "例: ja-JP-Neural2-B",
  });
  ttsVoiceNameField.id = "ttsVoiceName-wrapper";
  if (provider !== "google" || settings.googleTtsModelType !== "custom") ttsVoiceNameField.classList.add("hidden");

  const googleTtsInfoPanel = el("div", { id: "googleTtsInfoPanel", class: "panel-muted text-[10px] space-y-1 p-2 rounded border border-slate-100 dark:border-slate-800 text-slate-500" }, [
    el("p", { class: "font-bold text-slate-600 dark:text-slate-300", text: "💡 Google Cloud TTS 料金と無料枠/月" }),
    el("div", { class: "grid grid-cols-2 gap-x-2 text-slate-500" }, [
      el("span", { text: "標準 / WaveNet:" }), el("span", { class: "text-right font-semibold", text: "400万字無料 (超過 $4/M)" }),
      el("span", { text: "Neural2:" }), el("span", { class: "text-right font-semibold", text: "100万字無料 (超過 $16/M)" }),
      el("span", { text: "Chirp (HD):" }), el("span", { class: "text-right font-semibold", text: "100万字無料 (超過 $30/M)" }),
      el("span", { text: "Studio (高品質):" }), el("span", { class: "text-right font-semibold", text: "100万字無料 (超過 $160/M)" }),
    ])
  ]);
  if (provider !== "google") googleTtsInfoPanel.classList.add("hidden");

  const amivoiceApiKeyField = inputField({
    id: "amivoiceApiKey",
    label: "AmiVoice APIキー authorization",
    value: settings.amivoiceApiKey,
    type: "password",
    placeholder: "APPKEY",
  });

  const amivoiceEnginePresetField = selectField({
    id: "amivoiceEnginePreset",
    label: "AmiVoiceエンジン",
    value: selectedAmiVoiceEngine,
    options: AMIVOICE_ENGINES,
  });

  const amivoiceEngineField = inputField({
    id: "amivoiceEngine",
    label: "AmiVoice engine value",
    value: settings.amivoiceEngine,
    placeholder: "-a-general",
  });
  amivoiceEngineField.id = "amivoiceEngine-wrapper";
  amivoiceEngineField.classList.add("settings-wide");
  if (selectedAmiVoiceEngine !== "custom") amivoiceEngineField.classList.add("hidden");

  const amivoiceLoggingOptOutField = checkboxField({
    id: "amivoiceLoggingOptOut",
    label: "ログ保存をオプトアウト",
    checked: settings.amivoiceLoggingOptOut,
    help: "オンなら loggingOptOut=True。",
  });

  const amivoiceUseRawParamsField = checkboxField({
    id: "amivoiceUseRawParams",
    label: "dパラメータ直接指定",
    checked: settings.amivoiceUseRawParams,
    help: "オンなら下の文字列をそのまま送ります。",
  });

  const amivoiceRawParamsField = textareaField({
    id: "amivoiceRawParams",
    label: "AmiVoice dパラメータ",
    value: settings.amivoiceRawParams,
    placeholder: "grammarFileNames=-a2b-multi-general loggingOptOut=True",
    rows: 2,
  });
  amivoiceRawParamsField.id = "amivoiceRawParams-wrapper";
  amivoiceRawParamsField.classList.add("settings-wide");
  if (!settings.amivoiceUseRawParams) amivoiceRawParamsField.classList.add("hidden");

  const amivoiceUseProfileWordsField = checkboxField({
    id: "amivoiceUseProfileWords",
    label: "ユーザー辞書を使う",
    checked: settings.amivoiceUseProfileWords,
    help: "オンなら profileWords を送ります。",
  });

  const amivoiceProfileWordsField = textareaField({
    id: "amivoiceProfileWords",
    label: "AmiVoice profileWords",
    value: settings.amivoiceProfileWords,
    placeholder: "Alpha alfa\nBravo bravo\nrunway runway",
    rows: 2,
  });
  amivoiceProfileWordsField.id = "amivoiceProfileWords-wrapper";
  amivoiceProfileWordsField.classList.add("settings-wide");
  if (!settings.amivoiceUseProfileWords) amivoiceProfileWordsField.classList.add("hidden");

  // 2. DOMの構築

  const ttsBrowserBtn = el("button", {
    id: "ttsProviderBrowserBtn",
    class: `segment ${provider === "browser" ? "is-active" : ""}`,
    type: "button",
    text: "内蔵TTS",
  });

  const ttsGoogleBtn = el("button", {
    id: "ttsProviderGoogleBtn",
    class: `segment ${provider === "google" ? "is-active" : ""}`,
    type: "button",
    text: "Google TTS",
  });

  const ttsProviderInput = el("input", {
    id: "ttsProvider",
    type: "hidden",
    value: provider,
  });

  const panel = el("aside", { class: "settings-form" }, [
    el("span", { class: "status-pill settings-badge" }, [document.createRange().createContextualFragment(`${icon("key-round")} BYO API`)]),
    
    // APIガイド
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

    nativeLanguageField,
    geminiModelField,
    geminiModelCustomField,
    geminiApiKeyField,

    el("div", { class: "segmented settings-wide", role: "tablist" }, [
      ttsBrowserBtn,
      ttsGoogleBtn,
      ttsProviderInput
    ]),

    googleTtsApiKeyField,
    googleTtsModelTypeField,
    ttsVoiceNameField,
    googleTtsInfoPanel,

    amivoiceApiKeyField,
    amivoiceEnginePresetField,
    amivoiceEngineField,

    // 詳細アコーディオン
    el("details", {
      id: "amivoiceDetails",
      class: "settings-advanced settings-wide",
      open: settings.amivoiceDetailsOpen || false,
    }, [
      el("summary", { text: "AmiVoice詳細" }),
      el("div", { class: "settings-advanced-grid" }, [
        amivoiceLoggingOptOutField,
        amivoiceUseRawParamsField,
        amivoiceRawParamsField,
        amivoiceUseProfileWordsField,
        amivoiceProfileWordsField
      ]),
    ]),

    el("div", { class: "settings-actions settings-wide flex flex-col gap-2" }, [
      el("button", {
        class: "button button-primary w-full",
        type: "button",
        onclick: handlers.onSave,
      }, [document.createRange().createContextualFragment(`${icon("save")} 保存`)]),
      el("button", {
        class: "w-full py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all",
        type: "button",
        onclick: handlers.onStartWizard,
      }, [document.createRange().createContextualFragment(`${icon("navigation")} 初期セットアップガイドを起動`)]),
    ]),
  ]);

  // 3. ローカルイベント処理のバインド

  const toggleField = (selector, show) => {
    const el = panel.querySelector(selector);
    if (el) {
      if (show) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  };

  // Geminiモデル変更
  const selectGemini = panel.querySelector("#geminiModel");
  if (selectGemini) {
    selectGemini.addEventListener("change", (e) => {
      toggleField("#geminiModelCustom-wrapper", e.target.value === "custom");
    });
  }

  // TTSプロバイダタブ切り替え
  const handleTtsProviderChange = (prov) => {
    ttsBrowserBtn.classList.toggle("is-active", prov === "browser");
    ttsGoogleBtn.classList.toggle("is-active", prov === "google");
    ttsProviderInput.value = prov;

    const isGoogle = prov === "google";
    toggleField("#googleTtsApiKey-wrapper", isGoogle);
    toggleField("#googleTtsModelType-wrapper", isGoogle);
    
    const isCustomModel = panel.querySelector("#googleTtsModelType")?.value === "custom";
    toggleField("#ttsVoiceName-wrapper", isGoogle && isCustomModel);
    toggleField("#googleTtsInfoPanel", isGoogle);
  };

  ttsBrowserBtn.addEventListener("click", () => handleTtsProviderChange("browser"));
  ttsGoogleBtn.addEventListener("click", () => handleTtsProviderChange("google"));

  // Google TTSモデルタイプ変更
  const selectGoogleModelType = panel.querySelector("#googleTtsModelType");
  if (selectGoogleModelType) {
    selectGoogleModelType.addEventListener("change", (e) => {
      const prov = ttsProviderInput.value;
      toggleField("#ttsVoiceName-wrapper", prov === "google" && e.target.value === "custom");
    });
  }

  // AmiVoiceエンジン変更
  const selectAmiVoicePreset = panel.querySelector("#amivoiceEnginePreset");
  if (selectAmiVoicePreset) {
    selectAmiVoicePreset.addEventListener("change", (e) => {
      toggleField("#amivoiceEngine-wrapper", e.target.value === "custom");
    });
  }

  // AmiVoice dパラメータ
  const checkRawParams = panel.querySelector("#amivoiceUseRawParams");
  if (checkRawParams) {
    checkRawParams.addEventListener("change", (e) => {
      toggleField("#amivoiceRawParams-wrapper", e.target.checked);
    });
  }

  // AmiVoice ユーザー辞書
  const checkProfileWords = panel.querySelector("#amivoiceUseProfileWords");
  if (checkProfileWords) {
    checkProfileWords.addEventListener("change", (e) => {
      toggleField("#amivoiceProfileWords-wrapper", e.target.checked);
    });
  }

  return panel;
}
