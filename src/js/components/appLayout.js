import { el } from "../utils/dom.js";

export function AppLayout({ settingsPanel, lessonForm, lessonOutput, recorderPanel, evaluationPanel, historyPanel }) {
  return el("main", { class: "app-shell" }, [
    el("div", { class: "workspace-grid" }, [
      settingsPanel,
      el("div", { class: "space-y-4" }, [
        lessonForm,
        el("div", { class: "practice-grid" }, [
          el("div", { class: "space-y-4" }, [lessonOutput, evaluationPanel]),
          el("div", { class: "space-y-4" }, [recorderPanel, historyPanel]),
        ]),
      ]),
    ]),
  ]);
}
