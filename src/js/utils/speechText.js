export function normalizeSpeechText(text = "") {
  return String(text)
    .replace(/\*\*/g, "")
    .replace(/\s*\/\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
