import { TARGET_LANGUAGES } from "../data/languages.js";
import { USE_CASES } from "../data/useCases.js";
import { el, icon } from "../utils/dom.js";
import { selectField, textareaField } from "./field.js";

export function LessonForm(settings, handlers) {
  return el("section", { class: "panel p-4 space-y-4" }, [
    el("div", { class: "flex flex-wrap items-center justify-between gap-3" }, [
      el("div", {}, [
        el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: "Create" }),
        el("h2", { class: "text-xl font-black", text: "練習を作る" }),
      ]),
      el("span", { class: "status-pill", id: "statusText", text: "準備OK" }),
    ]),
    el("div", { class: "grid gap-3 md:grid-cols-2" }, [
      selectField({
        id: "targetLanguage",
        label: "学習したい言語",
        value: settings.targetLanguage,
        options: TARGET_LANGUAGES.map((language) => language.label),
      }),
      selectField({
        id: "useCase",
        label: "用途",
        value: settings.useCase,
        options: USE_CASES.map((item) => ({ value: item.id, label: item.label })),
      }),
    ]),
    textareaField({
      id: "sourceText",
      label: "母国語で練習したい内容",
      placeholder: "例: 管制塔に離陸許可を復唱する練習をしたい",
      rows: 6,
    }),
    el("pre", {
      class: "hidden max-h-40 overflow-auto rounded-lg border border-[var(--line)] bg-[#17211c] p-3 text-xs text-white",
      id: "statusDetail",
    }),
    el("button", {
      class: "button button-primary w-full md:w-auto",
      id: "generateLessonButton",
      type: "button",
      onclick: handlers.onGenerate,
    }, [document.createRange().createContextualFragment(`${icon("sparkles")} Geminiで練習文を作る`)]),
  ]);
}
