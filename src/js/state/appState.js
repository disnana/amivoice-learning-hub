import { loadHistory, loadSettings, saveHistory, saveSettings } from "./storage.js";
 
export const state = {
  settings: loadSettings(),
  history: loadHistory(),
  lesson: null,
  activeLessonIndex: 0,
  sourceText: "", // フォームの入力値を保持
  recording: {
    blob: null,
    mimeType: "",
    transcript: "",
  },
  evaluation: null,
  status: "準備OK",
  ui: {
    settingsOpen: false,
  },
};
 
export function updateSettings(nextSettings) {
  state.settings = { ...state.settings, ...nextSettings };
  saveSettings(state.settings);
}
 
export function pushHistory(entry) {
  state.history = [entry, ...state.history].slice(0, 20);
  saveHistory(state.history);
}
