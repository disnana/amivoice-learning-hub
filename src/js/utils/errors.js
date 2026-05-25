export async function readApiError(response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json.error?.message || json.message || text;
  } catch {
    return text || `${response.status} ${response.statusText}`;
  }
}

export function asMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
