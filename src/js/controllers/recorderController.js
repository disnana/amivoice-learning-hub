import { chooseRecorderMimeType } from "../utils/audio.js";

let recorder = null;
let stream = null;
let chunks = [];

export async function toggleRecording({ onStarted, onStopped }) {
  if (recorder && recorder.state === "recording") {
    recorder.stop();
    return;
  }

  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = chooseRecorderMimeType();
  chunks = [];
  recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size) chunks.push(event.data);
  });
  recorder.addEventListener("stop", () => {
    const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
    stream?.getTracks().forEach((track) => track.stop());
    onStopped(blob, recorder.mimeType || "audio/webm");
  });
  recorder.start();
  onStarted();
}
