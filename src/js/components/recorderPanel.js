import { el, icon } from "../utils/dom.js";

export function RecorderPanel(recording, handlers) {
  return el("section", { class: "panel p-4 space-y-3" }, [
    el("div", {}, [
      el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: "Speak" }),
      el("h2", { class: "text-xl font-black", text: "録音して認識" }),
    ]),
    el("div", { class: "grid grid-cols-2 gap-2" }, [
      el("button", {
        class: "button button-primary",
        id: "recordButton",
        type: "button",
        onclick: handlers.onToggleRecord,
      }, [document.createRange().createContextualFragment(`${icon("mic")} 録音開始`)]),
      el("button", {
        class: "button button-secondary",
        type: "button",
        onclick: handlers.onRecognize,
        disabled: recording.blob ? null : "disabled",
      }, [document.createRange().createContextualFragment(`${icon("send")} AmiVoiceへ送信`)]),
    ]),
    el("audio", {
      class: "w-full",
      controls: "controls",
      src: recording.blob ? URL.createObjectURL(recording.blob) : "",
    }),
    el("div", { class: "metric min-h-20" }, [
      el("p", { class: "field-label", text: "認識結果" }),
      el("p", { class: "mt-2 whitespace-pre-wrap text-sm", id: "transcriptText", text: recording.transcript || "まだ認識していません。" }),
    ]),
    el("button", {
      class: "button button-primary w-full",
      type: "button",
      onclick: handlers.onEvaluate,
      disabled: recording.transcript ? null : "disabled",
    }, [document.createRange().createContextualFragment(`${icon("badge-check")} Geminiで評価`)]),
  ]);
}
