import { el, icon } from "../utils/dom.js";

export function CandidateList(items = [], activeIndex, handlers) {
  if (!items || items.length === 0) {
    return document.createTextNode("");
  }

  return el("section", { class: "panel p-4 space-y-3" }, [
    el("div", { class: "flex items-center justify-between gap-3 border-bottom pb-2" }, [
      el("div", {}, [
        el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: "Questions" }),
        el("h2", { class: "text-lg font-black", text: "問題リスト" }),
      ]),
      items.length > 1 ? el("button", {
        class: "button button-secondary text-xs py-1 px-3 min-h-0",
        type: "button",
        onclick: (e) => {
          e.stopPropagation();
          const allText = items.map((item) => item.targetText).join(". ");
          handlers.onSpeak(allText);
        },
      }, [document.createRange().createContextualFragment(`${icon("volume-2")} すべて聞く`)])
        : document.createTextNode(""),
    ]),
    el("div", { class: "grid gap-2 max-h-[360px] overflow-y-auto pr-1" }, items.map((item, index) => {
      const isActive = index === activeIndex;
      const cardClass = `candidate-card flex items-center justify-between gap-3 cursor-pointer p-3 border-2 ${
        isActive
          ? "border-[var(--green)] bg-emerald-50/20"
          : "border-transparent bg-white hover:border-slate-200"
      }`;

      const recording = item.recording || {};
      const evaluation = item.evaluation;
      const status = item.status || "idle";

      // ステータス表示のバッジを構築
      let statusBadge = document.createTextNode("");
      if (status === "uploading") {
        statusBadge = el("span", { class: "status-pill py-0.5 px-2 text-[10px] text-[var(--blue)] animate-pulse", text: "認識中..." });
      } else if (status === "evaluating") {
        statusBadge = el("span", { class: "status-pill py-0.5 px-2 text-[10px] text-[var(--green)] animate-pulse", text: "評価中..." });
      } else if (evaluation) {
        statusBadge = el("span", { class: "status-pill py-0.5 px-2 text-[10px] text-white bg-[var(--green)] border-none", text: `${evaluation.score}点` });
      } else if (recording.blob) {
        statusBadge = el("span", { class: "status-pill py-0.5 px-2 text-[10px] text-amber-700 bg-amber-50 border-amber-200", text: "未評価" });
      }

      return el("article", {
        class: cardClass,
        onclick: () => handlers.onSelect(index),
      }, [
        el("div", { class: "min-w-0 flex-1" }, [
          el("div", { class: "flex items-center gap-2 mb-1" }, [
            el("span", {
              class: `status-pill py-0.5 px-1.5 text-[10px] font-bold ${
                isActive ? "bg-[var(--green)] text-white border-none" : ""
              }`,
              text: String(index + 1),
            }),
            el("strong", { class: "text-sm truncate block", text: item.targetText || "" }),
          ]),
          el("p", { class: "text-xs text-[var(--muted)] truncate", text: item.nativeMeaning || "" }),
        ]),
        el("div", { class: "flex items-center gap-2 flex-shrink-0" }, [
          statusBadge,
          el("button", {
            class: "button button-secondary p-1.5 min-h-0 rounded-lg",
            type: "button",
            title: "この文を聞く",
            onclick: (e) => {
              e.stopPropagation();
              handlers.onSpeak(item.targetText);
            },
          }, [document.createRange().createContextualFragment(icon("volume-2"))]),
        ]),
      ]);
    })),
  ]);
}
