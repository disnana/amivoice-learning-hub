import { NATIVE_LANGUAGES, TARGET_LANGUAGES } from "../data/languages.js";
import { el, icon, option } from "../utils/dom.js";

export function SetupWizard(currentSettings, handlers) {
  let step = 1;
  const totalSteps = 3;
  let errorMessage = ""; // バリデーションエラーメッセージ

  // ブラウザの言語環境から、インテリジェントにデフォルト言語を判定
  const browserLang = (navigator.language || navigator.userLanguage || "ja").toLowerCase();
  let defaultNative = "日本語";
  let defaultTarget = "英語";

  if (browserLang.startsWith("en")) {
    defaultNative = "English";
    defaultTarget = "日本語"; // 英語話者は日本語をターゲットにする
  } else if (browserLang.startsWith("ko")) {
    defaultNative = "한국어";
    defaultTarget = "英語";
  } else if (browserLang.startsWith("zh")) {
    defaultNative = "中文";
    defaultTarget = "英語";
  } else if (browserLang.startsWith("es")) {
    defaultNative = "Español";
    defaultTarget = "英語";
  } else {
    // デフォルト（日本語話者、または判定不能なその他）
    defaultNative = "日本語";
    defaultTarget = "英語";
  }

  // ローカルな一時設定値
  const values = {
    nativeLanguage: currentSettings.nativeLanguage || defaultNative,
    targetLanguage: currentSettings.targetLanguage || defaultTarget,
    useCase: currentSettings.useCase || "daily",
    customUseCase: currentSettings.customUseCase || "",
    geminiApiKey: currentSettings.geminiApiKey || "",
    amivoiceApiKey: currentSettings.amivoiceApiKey || "",
  };

  const container = el("div", {
    class: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl transition-all duration-500 p-4",
  });

  const card = el("div", {
    class: "w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.6)] border border-slate-200/50 dark:border-slate-800/80 overflow-hidden flex flex-col max-h-[92vh] transition-all duration-300 transform scale-100",
  });

  container.appendChild(card);

  function update() {
    card.replaceChildren(
      renderHeader(),
      renderContent(),
      renderFooter()
    );
    if (window.lucide) {
      window.lucide.createIcons(card);
    }
  }

  function renderHeader() {
    const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;
    
    return el("div", { class: "px-8 py-6 border-b border-slate-100/80 dark:border-slate-800/50 bg-slate-50/40 dark:bg-slate-900/30 flex flex-col gap-4" }, [
      el("div", { class: "flex items-center justify-between" }, [
        el("div", { class: "flex items-center gap-3" }, [
          el("div", { class: "p-2.5 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/20" }, [
            document.createRange().createContextualFragment(icon("navigation"))
          ]),
          el("h2", { class: "text-xl font-extrabold text-slate-800 dark:text-slate-100 Outfit tracking-wide", text: "PhrasePilot" })
        ]),
        el("span", { class: "text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full", text: `Step ${step} of ${totalSteps}` })
      ]),
      el("div", { class: "w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" }, [
        el("div", {
          class: "h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 transition-all duration-500 rounded-full",
          style: `width: ${progressPercent}%`
        })
      ])
    ]);
  }

  function renderContent() {
    const content = el("div", { class: "px-8 py-10 overflow-y-auto flex-1 space-y-8 max-h-[62vh] custom-scrollbar animate-fade-in" });

    if (errorMessage) {
      content.appendChild(
        el("div", { class: "p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex items-center gap-2" }, [
          document.createRange().createContextualFragment(icon("alert-circle")),
          document.createTextNode(errorMessage)
        ])
      );
    }

    if (step === 1) {
      content.appendChild(
        el("div", { class: "text-center space-y-6 py-6" }, [
          el("h3", { class: "text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400" }, [
            document.createTextNode("新しい語学体験へ飛び込もう")
          ]),
          el("p", { class: "text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto font-medium" }, [
            document.createTextNode("PhrasePilot は最新のAI（Gemini）と超高精度の音声認識（AmiVoice）を組み合わせた、新時代のインテリジェント発音・会話練習システムです。あなたのペースで、自然な対話をマスターしましょう。")
          ]),
          
          el("div", { class: "grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 text-left" }, [
            el("div", { class: "p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center text-center space-y-3 transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700" }, [
              el("div", { class: "p-3 bg-blue-500/10 text-blue-500 rounded-xl" }, [document.createRange().createContextualFragment(icon("bot"))]),
              el("span", { class: "text-sm font-extrabold text-slate-800 dark:text-slate-200", text: "AI練習文生成" }),
              el("p", { class: "text-xs text-slate-400 dark:text-slate-500 leading-relaxed", text: "Geminiがあなたの目的に沿った、今すぐ使える日常・ビジネス英語を生成します。" })
            ]),
            el("div", { class: "p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center text-center space-y-3 transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700" }, [
              el("div", { class: "p-3 bg-emerald-500/10 text-emerald-500 rounded-xl" }, [document.createRange().createContextualFragment(icon("mic"))]),
              el("span", { class: "text-sm font-extrabold text-slate-800 dark:text-slate-200", text: "超高精度音声認識" }),
              el("p", { class: "text-xs text-slate-400 dark:text-slate-500 leading-relaxed", text: "AmiVoiceがあなたの生音声を的確にキャッチ。曖昧な発音も見逃しません。" })
            ]),
            el("div", { class: "p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center text-center space-y-3 transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700" }, [
              el("div", { class: "p-3 bg-indigo-500/10 text-indigo-500 rounded-xl" }, [document.createRange().createContextualFragment(icon("award"))]),
              el("span", { class: "text-sm font-extrabold text-slate-800 dark:text-slate-200", text: "プロ級のフィードバック" }),
              el("p", { class: "text-xs text-slate-400 dark:text-slate-500 leading-relaxed", text: "単なるスコア表示だけでなく、どこをどう直せばより自然になるか具体的にコーチング。" })
            ])
          ])
        ])
      );
    } else if (step === 2) {
      // Step 2: 言語と目的の選択 (option 関数を使用して selected バグを解消)
      const nativeSelect = el("select", {
        class: "w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm",
      }, NATIVE_LANGUAGES.map(lang => option(lang, lang, values.nativeLanguage)));
      
      nativeSelect.addEventListener("change", (e) => { values.nativeLanguage = e.target.value; });

      const targetSelect = el("select", {
        class: "w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm",
      }, TARGET_LANGUAGES.map(lang => option(lang.label, lang.label, values.targetLanguage)));

      targetSelect.addEventListener("change", (e) => { values.targetLanguage = e.target.value; });

      const useCaseSelect = el("select", {
        class: "w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm",
      }, [
        { value: "daily", label: "日常会話 (Daily Conversation)" },
        { value: "business", label: "ビジネス (Business Speech & Meeting)" },
        { value: "travel", label: "旅行・海外観光 (Travel & Tourism)" },
        { value: "custom", label: "カスタム (自由に入力する)" },
      ].map(opt => option(opt.value, opt.label, values.useCase)));

      const customUseCaseWrapper = el("div", { class: `space-y-2.5 transition-all duration-300 ${values.useCase === "custom" ? "" : "hidden"}` }, [
        el("label", { class: "block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider", text: "具体的な学習目的" }),
        el("input", {
          type: "text",
          class: "w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm",
          value: values.customUseCase,
          placeholder: "例: ITエンジニア向けの英語ミーティング対策",
        })
      ]);

      const customInput = customUseCaseWrapper.querySelector("input");
      customInput.addEventListener("input", (e) => { values.customUseCase = e.target.value.trim(); });

      useCaseSelect.addEventListener("change", (e) => {
        values.useCase = e.target.value;
        if (values.useCase === "custom") {
          customUseCaseWrapper.classList.remove("hidden");
        } else {
          customUseCaseWrapper.classList.add("hidden");
        }
      });

      content.appendChild(
        el("div", { class: "space-y-6" }, [
          el("h3", { class: "text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight", text: "プロフィールの設定" }),
          
          el("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-6" }, [
            el("div", { class: "space-y-2.5" }, [
              el("label", { class: "block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider", text: "あなたの母国語" }),
              nativeSelect
            ]),
            el("div", { class: "space-y-2.5" }, [
              el("label", { class: "block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider", text: "練習したいターゲット言語" }),
              targetSelect
            ])
          ]),

          el("div", { class: "space-y-2.5" }, [
            el("label", { class: "block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider", text: "学習目的・シーン" }),
            useCaseSelect
          ]),

          customUseCaseWrapper
        ])
      );
    } else if (step === 3) {
      // Step 3: APIキーの設定 (Geminiは動作に必須)
      const geminiInput = el("input", {
        type: "password",
        class: "w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-mono",
        value: values.geminiApiKey,
        placeholder: "AIzaSy...",
      });
      geminiInput.addEventListener("input", (e) => {
        values.geminiApiKey = e.target.value.trim();
        if (values.geminiApiKey) errorMessage = ""; // 入力されたら即時エラー表示を消す
      });

      const amivoiceInput = el("input", {
        type: "password",
        class: "w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-mono",
        value: values.amivoiceApiKey,
        placeholder: "AmiVoice APPKEY (任意)",
      });
      amivoiceInput.addEventListener("input", (e) => { values.amivoiceApiKey = e.target.value.trim(); });

      content.appendChild(
        el("div", { class: "space-y-6" }, [
          el("h3", { class: "text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight", text: "APIキーの登録 (Geminiキー必須)" }),
          el("p", { class: "text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium" }, [
            document.createTextNode("PhrasePilot はサーバーレス設計のため、取得したAPIキーはあなたのブラウザ内（ローカルストレージ）にのみ安全に保存されます。"),
            el("span", { class: "block mt-2 font-bold text-rose-500", text: "※アプリを動作させるため、Gemini APIキーの入力が必須となっています。" })
          ]),

          el("div", { class: "space-y-2.5 pt-2" }, [
            el("div", { class: "flex items-center justify-between" }, [
              el("label", { class: "block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider", text: "Gemini APIキー (必須)" }),
              el("a", { href: "https://aistudio.google.com/api-keys", target: "_blank", class: "text-xs text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1 font-bold" }, [
                document.createRange().createContextualFragment(icon("external-link")),
                document.createTextNode("無料で取得する")
              ])
            ]),
            geminiInput
          ]),

          el("div", { class: "space-y-2.5 pt-2" }, [
            el("div", { class: "flex items-center justify-between" }, [
              el("label", { class: "block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider", text: "AmiVoice APIキー (高精度音声認識・任意)" }),
              el("a", { href: "https://acp.amivoice.com/", target: "_blank", class: "text-xs text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1 font-bold" }, [
                document.createRange().createContextualFragment(icon("external-link")),
                document.createTextNode("無料枠付き登録ページ")
              ])
            ]),
            amivoiceInput
          ])
        ])
      );
    }

    return content;
  }

  function renderFooter() {
    const footer = el("div", { class: "px-8 py-6 border-t border-slate-100/80 dark:border-slate-800/50 bg-slate-50/40 dark:bg-slate-900/30 flex items-center justify-between" });

    // スキップボタンの排除 (動作に必須なため、ウィザードでは必ず設定させる)
    if (step > 1) {
      const backBtn = el("button", {
        class: "px-6 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm md:text-base transition-colors outline-none",
        text: "戻る",
      });
      backBtn.addEventListener("click", () => {
        errorMessage = "";
        step--;
        update();
      });
      footer.appendChild(backBtn);
    } else {
      // 最初のステップのダミー余白
      footer.appendChild(el("div"));
    }

    if (step < totalSteps) {
      const nextBtn = el("button", {
        class: "px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm md:text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all outline-none",
        text: "次へ進む",
      });
      nextBtn.addEventListener("click", () => {
        step++;
        update();
      });
      footer.appendChild(nextBtn);
    } else {
      const finishBtn = el("button", {
        class: "px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm md:text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all outline-none",
        text: "セットアップ完了！",
      });
      finishBtn.addEventListener("click", () => {
        // バリデーション: Gemini APIキーが空の場合は進行をブロック
        if (!values.geminiApiKey) {
          errorMessage = "⚠️ PhrasePilot の動作には Gemini APIキーの入力が必須です。";
          update();
          return;
        }
        errorMessage = "";
        handlers.onSave(values);
      });

      footer.appendChild(finishBtn);
    }

    return footer;
  }

  update();

  return container;
}
