import { el } from "../utils/dom.js";

export function HistoryPanel(history) {
  return el("section", { class: "panel p-3 space-y-2" }, [
    el("div", {}, [
      el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: "History" }),
      el("h2", { class: "text-base font-black", text: "履歴" }),
    ]),
    history.length
      ? el("div", { class: "grid gap-2", style: "max-height: 240px; overflow-y: auto;" }, history.map((item) => el("div", { class: "panel-muted p-3" }, [
          el("div", { class: "flex items-center justify-between gap-3" }, [
            el("strong", { class: "text-sm truncate", text: item.title || "練習" }),
            el("span", { class: "status-pill", text: `${item.score ?? "-"}点` }),
          ]),
          el("p", { class: "mt-1 line-clamp-1 text-xs text-[var(--muted)]", text: item.targetText || "" }),
        ])))
      : el("p", { class: "text-xs text-[var(--muted)]", text: "まだ履歴はありません。" }),
  ]);
}
