import { el } from "../utils/dom.js";

function smallList(items = []) {
  return el("ul", { class: "grid gap-2" }, items.map((item) => el("li", { class: "feedback-item", text: item })));
}

function feedbackBlock(title, items = []) {
  return el("div", { class: "feedback-block" }, [
    el("p", { class: "field-label", text: title }),
    smallList(items),
  ]);
}

export function EvaluationPanel(evaluation) {
  if (!evaluation) {
    return el("section", { class: "panel p-4 text-xs text-[var(--muted)] text-center" }, [
      el("p", { text: "評価するとスコア、良かった点、直す点がここに出ます。" }),
    ]);
  }

  return el("section", { class: "panel p-4 space-y-4 evaluation-panel" }, [
    el("div", { class: "evaluation-head" }, [
      el("div", { class: "score-ring", style: `--score:${Number(evaluation.score) || 0}` }, [
        el("strong", { class: "score-value", text: String(evaluation.score ?? 0) }),
      ]),
      el("div", { class: "min-w-0" }, [
        el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: evaluation.passed ? "Passed" : "Retry" }),
        el("h2", { class: "evaluation-summary", text: evaluation.summary || "" }),
      ]),
    ]),
    feedbackBlock("良かった点", evaluation.goodPoints),
    feedbackBlock("直す点", evaluation.fixPoints),
    feedbackBlock("発音ズレの可能性", evaluation.likelyPronunciationIssues),
    el("div", { class: "feedback-next" }, [
      el("p", { class: "font-bold", text: "次の一手" }),
      el("p", { class: "mt-1 leading-relaxed", text: evaluation.nextAction || "" }),
    ]),
  ]);
}
