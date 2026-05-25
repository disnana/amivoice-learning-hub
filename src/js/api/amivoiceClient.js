import { AMIVOICE_ASYNC_ENDPOINT } from "../config/defaults.js";
import { readApiError } from "../utils/errors.js";

function buildParameters(settings) {
  if (settings.amivoiceUseRawParams && settings.amivoiceRawParams.trim()) {
    return settings.amivoiceRawParams.trim();
  }

  const parts = [
    `grammarFileNames=${settings.amivoiceEngine || "-a-general"}`,
    `loggingOptOut=${settings.amivoiceLoggingOptOut ? "True" : "False"}`,
  ];
  if (settings.amivoiceProfileWords.trim()) {
    parts.push(`profileWords=${encodeURIComponent(settings.amivoiceProfileWords.trim())}`);
  }
  return parts.join(" ");
}

export async function createAmiVoiceJob({ apiKey, audioBlob, fileName, settings }) {
  if (!apiKey) throw new Error("AmiVoice APIキーを設定してください。");
  if (!audioBlob) throw new Error("録音データがありません。");

  const form = new FormData();
  form.append("u", apiKey);
  form.append("d", buildParameters(settings));
  form.append("a", audioBlob, fileName || "practice.webm");

  const response = await fetch(AMIVOICE_ASYNC_ENDPOINT, {
    method: "POST",
    body: form,
  });

  if (!response.ok) throw new Error(await readApiError(response));
  return response.json();
}

export function getAmiVoiceSessionId(payload) {
  return payload?.session_id || payload?.sessionId || payload?.sessionid || payload?.sessionID || "";
}

export function formatAmiVoiceCreateError(payload) {
  const code = payload?.code ? ` code=${payload.code}` : "";
  const message = payload?.message || payload?.error || payload?.text || "sessionidがレスポンスに含まれていません。";
  const hint = message === "received illegal service authorization"
    ? "\n確認: AmiVoiceのAPIキー(APPKEY)を入力しているか、そのキーで指定エンジンを使えるか、前後に空白がないかを見てください。"
    : "";
  return `AmiVoiceのジョブ作成に失敗しました。${message}${code}${hint}\n${JSON.stringify(payload, null, 2)}`;
}

export async function pollAmiVoiceJob({ apiKey, sessionId, pollIntervalMs = 3000, maxAttempts = 40 }) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    const response = await fetch(`${AMIVOICE_ASYNC_ENDPOINT}/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) throw new Error(await readApiError(response));
    const payload = await response.json();
    if (payload.status === "completed") return payload;
    if (payload.status === "error" || payload.error) {
      throw new Error(payload.message || payload.error || "AmiVoiceの認識ジョブでエラーが発生しました。");
    }
  }
  throw new Error("AmiVoiceの認識が時間内に完了しませんでした。");
}

export function extractTranscript(payload) {
  if (payload.text) return payload.text;
  if (payload.results) {
    return payload.results
      .map((result) => result.text || result.words?.map((word) => word.label).join("") || "")
      .filter(Boolean)
      .join("\n");
  }
  if (payload.segments) return payload.segments.map((segment) => segment.text || "").join("\n");
  return "";
}
