export function parseJsonFromText(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

export function stringifyPretty(value) {
  return JSON.stringify(value, null, 2);
}
