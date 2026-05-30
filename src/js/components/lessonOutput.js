import { el, icon } from "../utils/dom.js";

function formatReadingGuide(text) {
  if (!text) return "";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--rose)] font-black border-b border-[var(--rose)]">$1</strong>')
    .replace(/\r?\n/g, "<br>");
}

function list(items = []) {
  return el("ul", { class: "grid gap-2" }, items.map((item) => el("li", { class: "feedback-item", text: item })));
}

function feedbackBlock(title, items = []) {
  return el("div", { class: "feedback-block" }, [
    el("p", { class: "field-label", text: title }),
    el("ul", { class: "grid gap-2" }, items.map((item) => el("li", { class: "feedback-item", text: item }))),
  ]);
}

export function LessonOutput(activeItem, handlers, { isAnyRecording, isRecordingThis, ttsSpeakingRate, speechRecProvider, amivoiceApiKey } = {}) {
  if (!activeItem) {
    return el("section", { class: "panel lesson-empty" }, [
      el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: "Lesson" }),
      el("h2", { class: "lesson-empty-title", text: "練習文はまだありません" }),
      el("p", {
        class: "lesson-empty-copy",
        text: "右パネルの条件を選んで「練習文を作る」を実行すると、ここに練習エリアが表示されます。",
      }),
    ]);
  }

  const recording = activeItem.recording || { blob: null, mimeType: "", transcript: "" };
  const evaluation = activeItem.evaluation;
  const status = activeItem.status || "idle";
  const error = activeItem.error || "";

  // 録音ボタンのテキストと状態
  const recordButtonText = isRecordingThis ? "録音停止" : "録音開始";
  const recordButtonClass = isRecordingThis ? "button button-danger" : "button button-primary";
  // 他のアイテムが録音中なら無効化
  const recordDisabled = (isAnyRecording && !isRecordingThis) || status === "uploading" || status === "evaluating" ? "disabled" : null;
  // 送信ボタンの無効化
  const recognizeDisabled = !recording.blob || isAnyRecording || status === "uploading" || status === "evaluating" ? "disabled" : null;
  // 評価ボタンの無効化
  const evaluateDisabled = !recording.transcript || isAnyRecording || status === "uploading" || status === "evaluating" ? "disabled" : null;

  return el("section", { class: "panel p-5 space-y-5" }, [
    /* 1. ヘッダー */
    el("div", { class: "flex flex-wrap items-center justify-between gap-3 border-bottom pb-3" }, [
      el("div", {}, [
        el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: activeItem.title || "Practice" }),
        el("h2", { class: "text-2xl font-black leading-tight text-[var(--ink)]", text: activeItem.targetText }),
      ]),
      el("div", { class: "flex items-center gap-2" }, [
        el("span", { class: "text-xs text-[var(--muted)] font-bold", text: "速度:" }),
        el("select", {
          class: "select py-1 px-2 text-xs min-h-0 bg-white border border-slate-200 rounded cursor-pointer",
          style: "width: auto; padding-right: 1.5rem;",
          onchange: (e) => {
            if (handlers.onSpeedChange) handlers.onSpeedChange(Number(e.target.value));
          }
        }, [
          el("option", { value: "0.6", selected: ttsSpeakingRate === 0.6 ? "selected" : null }, [document.createTextNode("0.6x (遅い)")]),
          el("option", { value: "0.8", selected: ttsSpeakingRate === 0.8 || ttsSpeakingRate === 0.86 ? "selected" : null }, [document.createTextNode("0.8x")]),
          el("option", { value: "1.0", selected: ttsSpeakingRate === 1.0 ? "selected" : null }, [document.createTextNode("1.0x (標準)")]),
          el("option", { value: "1.3", selected: ttsSpeakingRate === 1.3 ? "selected" : null }, [document.createTextNode("1.3x")]),
        ]),
        el("button", {
          class: "button button-secondary",
          type: "button",
          onclick: () => handlers.onSpeak(activeItem.targetText),
        }, [document.createRange().createContextualFragment(`${icon("volume-2")} 聞く`)]),
      ]),
    ]),

    /* 2. 基本情報 (意味・読み方) */
    el("div", { class: "grid gap-3 md:grid-cols-2" }, [
      el("div", { class: "metric" }, [
        el("p", { class: "field-label", text: "意味" }),
        el("p", { class: "mt-1 text-sm font-semibold", text: activeItem.nativeMeaning || "" }),
      ]),
      el("div", { class: "metric" }, [
        el("p", { class: "field-label", text: "読み方" }),
        el("p", { 
          class: "mt-1 reading-guide text-sm font-semibold tracking-wide", 
          style: "font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;",
          html: formatReadingGuide(activeItem.readingGuide || "") 
        }),
      ]),
    ]),

    /* 3. 区切り */
    el("div", {}, [
      el("p", { class: "field-label mb-2", text: "区切り" }),
      el("div", { class: "flex flex-wrap gap-2" }, (activeItem.chunks || []).map((chunk) => el("span", { class: "status-pill", text: chunk }))),
    ]),

    /* 4. 発音ポイント */
    el("div", {}, [el("p", { class: "field-label mb-2", text: "発音ポイント" }), list(activeItem.pronunciationTips)]),

    /* 5. コーチコメント */
    el("div", { class: "panel-muted p-3 text-sm border-l-4 border-[var(--blue)] pl-3" }, [
      el("p", { class: "font-bold text-[var(--blue)]", text: "コーチからのアドバイス" }),
      el("p", { class: "mt-1", text: activeItem.coachNote || "" }),
    ]),

    /* --- エラー表示 --- */
    error ? el("div", { class: "panel-muted p-3 border-l-4 border-[var(--rose)] bg-[var(--rose-light)] text-sm text-[var(--rose)]" }, [
      el("p", { class: "font-bold", text: "エラーが発生しました" }),
      el("p", { class: "mt-1", text: error }),
    ]) : document.createTextNode(""),

    /* --- 録音・認識エリア --- */
    el("div", { class: "panel p-4 space-y-3 bg-slate-50/50 border border-slate-100" }, [
      el("div", { class: "flex items-center justify-between" }, [
        el("h3", { class: "text-sm font-black", text: "発音を録音する" }),
        status === "uploading" ? el("span", { class: "status-pill text-[var(--blue)] animate-pulse", text: "AmiVoiceへ送信中..." }) : 
        status === "evaluating" ? el("span", { class: "status-pill text-[var(--green)] animate-pulse", text: "Gemini評価中..." }) : 
        isRecordingThis ? el("span", { class: "status-pill text-[var(--rose)] animate-pulse", text: "録音中..." }) : document.createTextNode(""),
      ]),
      el("div", { class: "grid grid-cols-2 gap-2" }, [
        el("button", {
          class: recordButtonClass,
          id: "recordButton",
          type: "button",
          onclick: handlers.onToggleRecord,
          disabled: recordDisabled,
        }, [document.createRange().createContextualFragment(`${icon("mic")} ${recordButtonText}`)]),
        el("button", {
          class: speechRecProvider === "browser" && recording.transcript && !recording.isAmiVoice
            ? "button button-secondary text-[var(--blue)] font-black border border-[var(--blue)] hover:bg-slate-100/80 transition-all"
            : "button button-secondary",
          type: "button",
          onclick: handlers.onRecognize,
          disabled: recognizeDisabled,
        }, [
          document.createRange().createContextualFragment(
            speechRecProvider === "browser" && recording.transcript && !recording.isAmiVoice
              ? `${icon("arrow-up-right")} AmiVoiceで高精度に修正`
              : `${icon("send")} AmiVoiceへ送信`
          )
        ]),
      ]),
      el("audio", {
        class: "w-full mt-2",
        controls: "controls",
        src: recording.blob ? URL.createObjectURL(recording.blob) : "",
      }),
      el("div", { class: "metric min-h-16 bg-white" }, [
        el("p", { 
          class: "field-label flex items-center gap-1.5", 
          html: recording.transcript
            ? (recording.isAmiVoice
              ? `<span class="inline-block w-2 h-2 rounded-full bg-[var(--blue)]"></span>AmiVoice認識結果 (高精度)`
              : `<span class="inline-block w-2 h-2 rounded-full bg-[var(--green)]"></span>ブラウザ内蔵認識結果 (爆速)`)
            : "音声認識結果"
        }),
        el("p", { class: "mt-1 whitespace-pre-wrap text-sm font-semibold", id: "transcriptText", text: recording.transcript || "まだ認識していません。" }),
      ]),
      // AmiVoiceキーが未設定かつブラウザ認識モードの時の親切なアナウンス
      !amivoiceApiKey && speechRecProvider === "browser" && recording.transcript && !recording.isAmiVoice
        ? el("button", {
            type: "button",
            class: "w-full text-[10.5px] text-[var(--blue)] font-bold mt-1.5 mb-0.5 text-center hover:underline cursor-pointer bg-transparent border-0 flex items-center justify-center gap-1 transition-all",
            onclick: () => handlers.onOpenSettings("amivoiceApiKey")
          }, [
            document.createRange().createContextualFragment(`${icon("key-round")} AmiVoice APIキーを設定して、高精度な再文字起こしを利用する`)
          ])
        : document.createTextNode(""),
      el("button", {
        class: "button button-primary w-full",
        type: "button",
        onclick: handlers.onEvaluate,
        disabled: evaluateDisabled,
      }, [document.createRange().createContextualFragment(`${icon("badge-check")} Geminiで評価する`)]),
    ]),

    /* --- 評価結果エリア --- */
    evaluation ? el("div", { class: "panel p-4 space-y-4 border border-[var(--green)] bg-[var(--mint)]" }, [
      el("div", { class: "evaluation-head" }, [
        el("div", { class: "score-ring bg-white", style: `--score:${Number(evaluation.score) || 0}` }, [
          el("strong", { class: "score-value", text: String(evaluation.score ?? 0) }),
        ]),
        el("div", { class: "min-w-0" }, [
          el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: evaluation.passed ? "Passed" : "Retry" }),
          el("h2", { class: "evaluation-summary", text: evaluation.summary || "" }),
        ]),
      ]),
      feedbackBlock("良かった点", evaluation.goodPoints),
      feedbackBlock("直す点", evaluation.fixPoints),
      evaluation.likelyPronunciationIssues && evaluation.likelyPronunciationIssues.length ? feedbackBlock("発音ズレの可能性", evaluation.likelyPronunciationIssues) : document.createTextNode(""),
      el("div", { class: "feedback-next bg-white" }, [
        el("p", { class: "font-bold text-[var(--green)]", text: "次の一手" }),
        el("p", { class: "mt-1 text-sm leading-relaxed", text: evaluation.nextAction || "" }),
      ]),
    ]) : el("div", { class: "panel-muted p-4 text-xs text-[var(--muted)] text-center" }, [
      el("p", { text: "録音して送信・認識が完了した後に「Geminiで評価する」を押すと、評価フィードバックがここに出ます。" }),
    ]),
  ]);
}
