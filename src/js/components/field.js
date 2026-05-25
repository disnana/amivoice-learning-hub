import { el, option } from "../utils/dom.js";

export function inputField({ id, label, value = "", type = "text", placeholder = "", autocomplete = "off" }) {
  return el("label", { class: "field", for: id }, [
    el("span", { class: "field-label", text: label }),
    el("input", { id, class: "input", type, value, placeholder, autocomplete }),
  ]);
}

export function textareaField({ id, label, value = "", placeholder = "", rows = 5 }) {
  const node = el("textarea", { id, class: "textarea", placeholder, rows });
  node.value = value;
  return el("label", { class: "field", for: id }, [el("span", { class: "field-label", text: label }), node]);
}

export function selectField({ id, label, value, options }) {
  return el("label", { class: "field", for: id }, [
    el("span", { class: "field-label", text: label }),
    el("select", { id, class: "select" }, options.map((item) => option(item.value ?? item, item.label ?? item, value))),
  ]);
}

export function checkboxField({ id, label, checked = false, help = "" }) {
  const input = el("input", { id, type: "checkbox", class: "h-4 w-4 accent-[var(--green)]" });
  input.checked = Boolean(checked);
  return el("label", { class: "flex items-start gap-3 rounded-lg border border-[var(--line)] bg-white p-3", for: id }, [
    input,
    el("span", { class: "grid gap-1" }, [
      el("span", { class: "text-sm font-bold", text: label }),
      help ? el("span", { class: "text-xs text-[var(--muted)]", text: help }) : document.createTextNode(""),
    ]),
  ]);
}
