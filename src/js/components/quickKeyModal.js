import { el, icon } from "../utils/dom.js";

export function QuickKeyModal({ keyType, initialValue, onSave, onClose }) {
  let title = "APIキー登録";
  let label = "APIキー";
  let placeholder = "キーを入力してください";
  let iconName = "key-round";

  if (keyType === "gemini") {
    title = "Gemini APIキーの登録";
    label = "Gemini APIキー";
    placeholder = "AIzaSy...";
    iconName = "cpu";
  } else if (keyType === "amivoice") {
    title = "AmiVoice APIキーの登録";
    label = "AmiVoice APPKEY";
    placeholder = "APPKEYを入力";
    iconName = "mic";
  } else if (keyType === "googleTts") {
    title = "Google TTS APIキーの登録";
    label = "Google Cloud TTS APIキー";
    placeholder = "APIキーを入力";
    iconName = "volume-2";
  }

  const inputEl = el("input", {
    type: "password",
    class: "input w-full",
    value: initialValue || "",
    placeholder: placeholder,
    id: `quick-${keyType}-input`,
    autocomplete: "off",
  });

  return el("div", { 
    class: "modal-backdrop z-[120]",
    onclick: (e) => {
      if (e.target === e.currentTarget) onClose();
    }
  }, [
    el("div", { 
      class: "panel p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 shadow-2xl space-y-4 max-w-sm w-full animate-fade-in",
      style: "box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);"
    }, [
      el("div", { class: "flex items-center justify-between border-bottom pb-2.5" }, [
        el("div", { class: "flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200" }, [
          document.createRange().createContextualFragment(`${icon(iconName)} <span class="text-sm font-black">${title}</span>`)
        ]),
        el("button", {
          type: "button",
          class: "w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all",
          onclick: onClose
        }, [document.createTextNode("✕")])
      ]),
      el("div", { class: "space-y-1.5" }, [
        el("span", { class: "field-label", text: label }),
        inputEl
      ]),
      el("div", { class: "flex gap-2 justify-end pt-1" }, [
        el("button", {
          type: "button",
          class: "button button-secondary text-xs py-2 px-3.5 font-bold",
          onclick: onClose
        }, [document.createTextNode("キャンセル")]),
        el("button", {
          type: "button",
          class: "button button-primary text-xs py-2 px-4 font-bold",
          onclick: () => onSave(inputEl.value.trim())
        }, [document.createRange().createContextualFragment(`${icon("save")} 保存`)])
      ])
    ])
  ]);
}
