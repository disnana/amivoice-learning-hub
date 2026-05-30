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

  const hasGemini = Boolean(settings.geminiApiKey?.trim());
  const hasAmiVoice = Boolean(settings.amivoiceApiKey?.trim());
  const hasGoogleTts = Boolean(settings.googleTtsApiKey?.trim());

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
  amivoiceApiKeyField.id = "amivoiceApiKey-wrapper";

  const amivoiceEnginePresetField = selectField({
    id: "amivoiceEnginePreset",
    label: "AmiVoiceエンジン",
    value: selectedAmiVoiceEngine,
    options: AMIVOICE_ENGINES,
  });
  amivoiceEnginePresetField.id = "amivoiceEnginePreset-wrapper";

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

  // 音声認識プロバイダ
  const recProvider = settings.speechRecProvider || "browser";

  const recBrowserBtn = el("button", {
    id: "recProviderBrowserBtn",
    class: `segment ${recProvider === "browser" ? "is-active" : ""}`,
    type: "button",
    text: "内蔵認識(爆速)",
  });

  const recAmiVoiceBtn = el("button", {
    id: "recProviderAmiVoiceBtn",
    class: `segment ${recProvider === "amivoice" ? "is-active" : ""}`,
    type: "button",
    text: "AmiVoice(高精度)",
  });

  const recProviderInput = el("input", {
    id: "speechRecProvider",
    type: "hidden",
    value: recProvider,
  });

  // タブ切り替えボタン
  const tabGeneralBtn = el("button", {
    id: "tabGeneralBtn",
    class: "segment is-active",
    type: "button",
    text: "⚙️ 一般・プロバイダ設定",
  });

  const tabApiKeysBtn = el("button", {
    id: "tabApiKeysBtn",
    class: "segment",
    type: "button",
    text: "🔑 API接続・キー設定",
  });

  // APIガイド（APIキー設定タブで表示）
  const apiGuidePanel = el("div", { class: "settings-wide panel-muted text-[11px] space-y-1.5 p-2.5 rounded border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 mb-1" }, [
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
  ]);

  // アコーディオン要素
  const amivoiceDetails = el("details", {
    id: "amivoiceDetails",
    class: "settings-advanced settings-wide",
    open: settings.amivoiceDetailsOpen || false,
  }, [
    el("summary", { text: "AmiVoice詳細設定" }),
    el("div", { class: "settings-advanced-grid" }, [
      amivoiceLoggingOptOutField,
      amivoiceUseRawParamsField,
      amivoiceRawParamsField,
      amivoiceUseProfileWordsField,
      amivoiceProfileWordsField
    ]),
  ]);

  // 1. 一般・プロバイダ設定エリア
  const generalArea = el("div", {
    id: "generalSettingsArea",
    class: "settings-wide flex flex-col gap-3 mt-1"
  }, [
    nativeLanguageField,

    // 音声合成プロバイダ
    el("div", { class: "field settings-wide" }, [
      el("span", { class: "field-label", text: "音声合成 (TTS) プロバイダ" }),
      el("div", { class: "segmented", role: "tablist" }, [
        ttsBrowserBtn,
        ttsGoogleBtn,
        ttsProviderInput
      ])
    ]),

    googleTtsModelTypeField,
    ttsVoiceNameField,
    googleTtsInfoPanel,

    // 音声認識プロバイダ
    el("div", { class: "field settings-wide" }, [
      el("span", { class: "field-label", text: "音声認識プロバイダ" }),
      el("div", { class: "segmented", role: "tablist" }, [
        recBrowserBtn,
        recAmiVoiceBtn,
        recProviderInput
      ])
    ]),

    amivoiceEnginePresetField,
    amivoiceEngineField,
    amivoiceDetails
  ]);

  // 2. API接続・キー設定エリア
  const apiKeysArea = el("div", {
    id: "apiKeysArea",
    class: "settings-wide flex flex-col gap-4 mt-2 hidden"
  }, [
    apiGuidePanel,

    // Gemini
    el("div", { class: "settings-wide p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4 mt-1" }, [
      el("div", { class: "flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2" }, [
        document.createRange().createContextualFragment(`${icon("cpu")} <span class="font-bold text-xs text-[var(--green)] uppercase tracking-wider">Gemini AI 設定</span>`)
      ]),
      geminiApiKeyField,
      geminiModelField,
      geminiModelCustomField
    ]),

    // AmiVoice
    el("div", { class: "settings-wide p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4 mt-1" }, [
      el("div", { class: "flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2" }, [
        document.createRange().createContextualFragment(`${icon("mic")} <span class="font-bold text-xs text-[var(--blue)] uppercase tracking-wider">AmiVoice 設定</span>`)
      ]),
      amivoiceApiKeyField,
      el("p", { class: "text-[10px] text-slate-400 dark:text-slate-500 italic mt-1 leading-normal", text: "※マイク入力音声をAmiVoice ACPサーバーに送信し、高精度な文字起こしを生成するためのAPIキーです。" })
    ]),

    // Google TTS (BYO API)
    el("div", { class: "settings-wide p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4 mt-1" }, [
      el("div", { class: "flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2" }, [
        document.createRange().createContextualFragment(`${icon("volume-2")} <span class="font-bold text-xs text-amber-500 uppercase tracking-wider">Google TTS 設定 (オプション)</span>`)
      ]),
      googleTtsApiKeyField,
      el("p", { class: "text-[10px] text-slate-400 dark:text-slate-500 italic mt-1 leading-normal", text: "※Google Cloud TTS (有料・超高品質音声) を直接使用したい場合に入力します（未入力ならブラウザ内蔵音声）。" })
    ])
  ]);

  const switchTab = (tabName) => {
    if (tabName === "general") {
      tabGeneralBtn.classList.add("is-active");
      tabApiKeysBtn.classList.remove("is-active");
      generalArea.classList.remove("hidden");
      apiKeysArea.classList.add("hidden");
    } else {
      tabGeneralBtn.classList.remove("is-active");
      tabApiKeysBtn.classList.add("is-active");
      generalArea.classList.add("hidden");
      apiKeysArea.classList.remove("hidden");
    }
  };

  tabGeneralBtn.addEventListener("click", () => switchTab("general"));
  tabApiKeysBtn.addEventListener("click", () => switchTab("apikeys"));

  const panel = el("aside", { class: "settings-form" }, [
    el("span", { class: "status-pill settings-badge" }, [document.createRange().createContextualFragment(`${icon("key-round")} BYO API`)]),
    
    // APIキー設定状況ステータスパネル
    el("div", { class: "settings-wide flex flex-col gap-2 p-2.5 rounded-lg bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-xs mb-1" }, [
      el("div", { class: "flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200 text-[11px]" }, [
        document.createRange().createContextualFragment(`${icon("key-round")} 🔑 APIキー接続ステータス`)
      ]),
      el("div", { class: "grid grid-cols-3 gap-1.5 mt-1" }, [
        el("button", {
          type: "button",
          class: `py-1.5 px-2 rounded-md text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 shadow-sm border ${hasGemini ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/90 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40" : "bg-rose-50/80 text-rose-700 border-rose-200/60 hover:bg-rose-100/90 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40 border-dashed"}`,
          onclick: () => {
            if (handlers.onOpenQuickKeyModal) {
              handlers.onOpenQuickKeyModal("gemini");
            }
          }
        }, [
          el("span", { class: "font-bold text-[9px] opacity-75", text: "Gemini AI" }),
          el("span", { class: "font-black text-[10px]", text: hasGemini ? "🟢 接続完了" : "🔴 未設定" })
        ]),
        el("button", {
          type: "button",
          class: `py-1.5 px-2 rounded-md text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 shadow-sm border ${hasAmiVoice ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/90 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40" : "bg-rose-50/80 text-rose-700 border-rose-200/60 hover:bg-rose-100/90 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40 border-dashed"}`,
          onclick: () => {
            if (handlers.onOpenQuickKeyModal) {
              handlers.onOpenQuickKeyModal("amivoice");
            }
          }
        }, [
          el("span", { class: "font-bold text-[9px] opacity-75", text: "AmiVoice" }),
          el("span", { class: "font-black text-[10px]", text: hasAmiVoice ? "🟢 接続完了" : "🔴 未設定" })
        ]),
        el("button", {
          type: "button",
          class: `py-1.5 px-2 rounded-md text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 shadow-sm border ${hasGoogleTts ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/90 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40" : "bg-amber-50/80 text-amber-700 border-amber-200/60 hover:bg-amber-100/90 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40 border-dashed"}`,
          onclick: () => {
            if (handlers.onOpenQuickKeyModal) {
              handlers.onOpenQuickKeyModal("googleTts");
            }
          }
        }, [
          el("span", { class: "font-bold text-[9px] opacity-75", text: "Google TTS" }),
          el("span", { class: "font-black text-[10px]", text: hasGoogleTts ? "🟢 接続完了" : "🟡 オプション" })
        ])
      ])
    ]),

    // タブ切り替えセグメント
    el("div", { class: "segmented settings-wide mb-2 mt-2", role: "tablist" }, [
      tabGeneralBtn,
      tabApiKeysBtn
    ]),

    // 各コンテンツエリア
    generalArea,
    apiKeysArea,

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

  // 音声認識プロバイダ切り替え
  const handleRecProviderChange = (prov) => {
    recBrowserBtn.classList.toggle("is-active", prov === "browser");
    recAmiVoiceBtn.classList.toggle("is-active", prov === "amivoice");
    recProviderInput.value = prov;

    const isAmi = prov === "amivoice";
    toggleField("#amivoiceEnginePreset-wrapper", isAmi);
    
    const isCustomEngine = panel.querySelector("#amivoiceEnginePreset")?.value === "custom";
    toggleField("#amivoiceEngine-wrapper", isAmi && isCustomEngine);
    toggleField("#amivoiceDetails", isAmi);
  };

  recBrowserBtn.addEventListener("click", () => handleRecProviderChange("browser"));
  recAmiVoiceBtn.addEventListener("click", () => handleRecProviderChange("amivoice"));

  // 初期読み込み時のトグル状態の適用
  handleRecProviderChange(recProvider);

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
