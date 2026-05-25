import { el, icon } from "../utils/dom.js";

function list(items = []) {
  return el("ul", { class: "grid gap-2" }, items.map((item) => el("li", { class: "panel-muted p-3 text-sm", text: item })));
}

export function LessonOutput(lesson, handlers) {
  if (!lesson) {
    return el("section", { class: "panel p-5 text-sm text-[var(--muted)]" }, [
      el("p", { text: "練習文を生成すると、ここに読み方・区切り・発音ポイントが出ます。" }),
    ]);
  }

  return el("section", { class: "panel p-4 space-y-4" }, [
    el("div", { class: "flex flex-wrap items-center justify-between gap-3" }, [
      el("div", {}, [
        el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: lesson.title || "Practice" }),
        el("h2", { class: "text-2xl font-black leading-tight", text: lesson.targetText }),
      ]),
      el("button", {
        class: "button button-secondary",
        type: "button",
        onclick: handlers.onSpeak,
      }, [document.createRange().createContextualFragment(`${icon("volume-2")} 聞く`)]),
    ]),
    el("div", { class: "grid gap-3 md:grid-cols-2" }, [
      el("div", { class: "metric" }, [
        el("p", { class: "field-label", text: "意味" }),
        el("p", { class: "mt-1 text-sm", text: lesson.nativeMeaning || "" }),
      ]),
      el("div", { class: "metric" }, [
        el("p", { class: "field-label", text: "読み方" }),
        el("p", { class: "mt-1 text-sm", text: lesson.readingGuide || "" }),
      ]),
    ]),
    el("div", {}, [
      el("p", { class: "field-label mb-2", text: "区切り" }),
      el("div", { class: "flex flex-wrap gap-2" }, (lesson.chunks || []).map((chunk) => el("span", { class: "status-pill", text: chunk }))),
    ]),
    el("div", {}, [el("p", { class: "field-label mb-2", text: "発音ポイント" }), list(lesson.pronunciationTips)]),
    el("div", { class: "panel-muted p-3 text-sm" }, [
      el("p", { class: "font-bold", text: "方針" }),
      el("p", { class: "mt-1", text: lesson.coachNote || "" }),
    ]),
  ]);
}
