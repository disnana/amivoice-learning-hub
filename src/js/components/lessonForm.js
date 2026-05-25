import { TARGET_LANGUAGES } from "../data/languages.js";
import { LESSON_COUNTS } from "../data/lessonCounts.js";
import { USE_CASES } from "../data/useCases.js";
import { el, icon } from "../utils/dom.js";
import { inputField, selectField, textareaField } from "./field.js";

export function LessonForm(settings, handlers) {
  return el("section", { class: "panel p-4 space-y-3" }, [
    el("div", { class: "flex flex-wrap items-center justify-between gap-3" }, [
      el("div", {}, [
        el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: "Create" }),
        el("h2", { class: "text-xl font-black", text: "練習を作る" }),
      ]),
    ]),
    el("div", { class: "grid grid-cols-2 gap-3" }, [
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
      selectField({
        id: "lessonCountMode",
        label: "作成数",
        value: settings.lessonCountMode,
        options: LESSON_COUNTS,
      }),
    ]),
    settings.useCase === "custom" ? inputField({
      id: "customUseCase",
      label: "用途 カスタム",
      value: settings.customUseCase,
      placeholder: "例: ホテルのチェックインで自然に話す",
    }) : document.createTextNode(""),
    settings.lessonCountMode === "custom" ? inputField({
      id: "lessonCountCustom",
      label: "作成数 カスタム",
      value: String(settings.lessonCount),
      type: "number",
      placeholder: "1から20",
    }) : document.createTextNode(""),
    textareaField({
      id: "sourceText",
      label: "母国語で練習したい内容 任意",
      placeholder: "空欄なら指定なしで練習文を作ります。例: 管制塔に離陸許可を復唱する練習をしたい",
      rows: 4,
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
  ].map((node) => {
    if (node.nodeType === Node.TEXT_NODE) return node;
    if (node.querySelector?.("#useCase")) node.querySelector("#useCase").addEventListener("change", handlers.onOptionChange);
    if (node.querySelector?.("#lessonCountMode")) node.querySelector("#lessonCountMode").addEventListener("change", handlers.onOptionChange);
    return node;
  }));
}
