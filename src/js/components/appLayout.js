import { el, icon } from "../utils/dom.js";

export function AppLayout({
  settingsPanel,
  lessonForm,
  lessonOutput,
  candidateList,
  historyPanel,
  settingsOpen,
  onOpenSettings,
  onCloseSettings,
}) {
  return el("main", { class: "app-shell" }, [
    el("header", { class: "app-header" }, [
      el("div", {}, [
        el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: "PhrasePilot" }),
        el("h1", { class: "app-title", text: "発音練習ダッシュボード" }),
      ]),
      el("div", { class: "app-header-actions" }, [
        el("span", { class: "status-pill", id: "statusText", text: "準備OK" }),
        el("button", {
          class: "button button-secondary",
          type: "button",
          onclick: onOpenSettings,
        }, [document.createRange().createContextualFragment(`${icon("settings")} 設定`)]),
      ]),
    ]),
    el("div", { class: "practice-shell" }, [
      el("section", { class: "main-stage" }, [lessonOutput]),
      el("aside", { class: "side-panel" }, [lessonForm, candidateList, historyPanel]),
    ]),
    settingsOpen ? el("div", { class: "modal-backdrop", onclick: onCloseSettings }, [
      el("div", { class: "settings-modal", onclick: (event) => event.stopPropagation() }, [
        el("div", { class: "modal-head" }, [
          el("div", {}, [
            el("p", { class: "text-xs font-black uppercase tracking-wide text-[var(--green)]", text: "Setup" }),
            el("h2", { class: "text-xl font-black", text: "APIと認識設定" }),
          ]),
          el("button", {
            class: "button button-secondary",
            type: "button",
            onclick: onCloseSettings,
          }, [document.createRange().createContextualFragment(`${icon("x")} 閉じる`)]),
        ]),
        settingsPanel,
      ]),
    ]) : document.createTextNode(""),
  ]);
}
