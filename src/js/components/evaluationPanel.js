import { el } from "../utils/dom.js";

function smallList(items = []) {
  return el("ul", { class: "mt-2 grid gap-2" }, items.map((item) => el("li", { class: "text-sm", text: item })));
}

export function EvaluationPanel(evaluation) {
  if (!evaluation) {
    return el("section", { class: "panel p-5 text-sm text-[var(--muted)]" }, [
      el("p", { text: "評価するとスコア、良かった点、直す点がここに出ます。" }),
    ]);
  }

  return el("section", { class: "panel p-4 space-y-4" }, [
    el("div", { class: "flex items-center gap-4" }, [
      el("div", { class: "score-ring", style: `--score:${Number(evaluation.score) || 0}` }, [
        el("strong", { class: "text-2xl", text: String(evaluation.score ?? 0) }),
      ]),
      el("div", {}, [
        el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: evaluation.passed ? "Passed" : "Retry" }),
        el("h2", { class: "text-xl font-black", text: evaluation.summary || "" }),
      ]),
    ]),
    el("div", { class: "grid gap-3 md:grid-cols-2" }, [
      el("div", { class: "metric" }, [el("p", { class: "field-label", text: "良かった点" }), smallList(evaluation.goodPoints)]),
      el("div", { class: "metric" }, [el("p", { class: "field-label", text: "直す点" }), smallList(evaluation.fixPoints)]),
    ]),
    el("div", { class: "metric" }, [
      el("p", { class: "field-label", text: "発音ズレの可能性" }),
      smallList(evaluation.likelyPronunciationIssues),
    ]),
    el("div", { class: "panel-muted p-3 text-sm" }, [
      el("p", { class: "font-bold", text: "次の一手" }),
      el("p", { class: "mt-1", text: evaluation.nextAction || "" }),
    ]),
  ]);
}
