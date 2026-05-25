import {
  createAmiVoiceJob,
  extractTranscript,
  formatAmiVoiceCreateError,
  getAmiVoiceSessionId,
  pollAmiVoiceJob,
} from "./api/amivoiceClient.js";
import { generateGeminiJson } from "./api/geminiClient.js";
import { speakWithBrowser, synthesizeWithGoogleTts } from "./api/googleTtsClient.js";
import { AppLayout } from "./components/appLayout.js";
import { EvaluationPanel } from "./components/evaluationPanel.js";
import { HistoryPanel } from "./components/historyPanel.js";
import { LessonForm } from "./components/lessonForm.js";
import { LessonOutput } from "./components/lessonOutput.js";
import { RecorderPanel } from "./components/recorderPanel.js";
import { SettingsPanel } from "./components/settingsPanel.js";
import { toggleRecording } from "./controllers/recorderController.js";
import { AMIVOICE_ENGINES } from "./data/models.js";
import { buildEvaluationPrompt } from "./prompts/evaluationPrompt.js";
import { buildLessonPrompt } from "./prompts/lessonPrompt.js";
import { pushHistory, state, updateSettings } from "./state/appState.js";
import { asMessage } from "./utils/errors.js";
import { setIconRoot } from "./utils/dom.js";

const app = document.querySelector("#app");

function readSettingsFromDom() {
  const preset = document.querySelector("#amivoiceEnginePreset")?.value;
  const presetValue = AMIVOICE_ENGINES.find((engine) => engine.value === preset)?.value;
  const selectedGeminiModel = document.querySelector("#geminiModel")?.value || state.settings.geminiModel;
  const customGeminiModel = document.querySelector("#geminiModelCustom")?.value.trim();
  return {
    nativeLanguage: document.querySelector("#nativeLanguage")?.value || state.settings.nativeLanguage,
    targetLanguage: document.querySelector("#targetLanguage")?.value || state.settings.targetLanguage,
    useCase: document.querySelector("#useCase")?.value || state.settings.useCase,
    geminiModel: selectedGeminiModel === "custom"
      ? customGeminiModel || state.settings.geminiModel
      : selectedGeminiModel,
    geminiApiKey: document.querySelector("#geminiApiKey")?.value.trim() || "",
    googleTtsApiKey: document.querySelector("#googleTtsApiKey")?.value.trim() || "",
    ttsVoiceName: document.querySelector("#ttsVoiceName")?.value || "",
    amivoiceApiKey: document.querySelector("#amivoiceApiKey")?.value.trim() || "",
    amivoiceEngine: preset === "custom"
      ? document.querySelector("#amivoiceEngine")?.value || "-a-general"
      : presetValue || "-a-general",
    amivoiceLoggingOptOut: Boolean(document.querySelector("#amivoiceLoggingOptOut")?.checked),
    amivoiceUseRawParams: Boolean(document.querySelector("#amivoiceUseRawParams")?.checked),
    amivoiceRawParams: document.querySelector("#amivoiceRawParams")?.value || "grammarFileNames=-a-general loggingOptOut=True",
    amivoiceProfileWords: document.querySelector("#amivoiceProfileWords")?.value || "",
  };
}

function setStatus(message) {
  state.status = message;
  const statusText = document.querySelector("#statusText");
  const statusDetail = document.querySelector("#statusDetail");
  const [firstLine] = String(message).split("\n");
  if (statusText) statusText.textContent = firstLine.length > 44 ? `${firstLine.slice(0, 44)}...` : firstLine;
  if (statusDetail) {
    statusDetail.textContent = String(message);
    statusDetail.classList.toggle("hidden", !String(message).includes("\n"));
  }
}

function render() {
  app.replaceChildren(AppLayout({
    settingsPanel: SettingsPanel(state.settings, {
      onSave: () => {
        updateSettings(readSettingsFromDom());
        setStatus("設定を保存しました。");
        render();
      },
      onTtsProvider: (provider) => {
        updateSettings({ ...readSettingsFromDom(), ttsProvider: provider });
        render();
      },
    }),
    lessonForm: LessonForm(state.settings, { onGenerate: handleGenerateLesson }),
    lessonOutput: LessonOutput(state.lesson, { onSpeak: handleSpeak }),
    recorderPanel: RecorderPanel(state.recording, {
      onToggleRecord: handleToggleRecord,
      onRecognize: handleRecognize,
      onEvaluate: handleEvaluate,
    }),
    evaluationPanel: EvaluationPanel(state.evaluation),
    historyPanel: HistoryPanel(state.history),
  }));
  setStatus(state.status);
  setIconRoot(app);
}

async function handleGenerateLesson() {
  try {
    updateSettings(readSettingsFromDom());
    const sourceText = document.querySelector("#sourceText")?.value.trim();
    if (!sourceText) throw new Error("練習したい内容を入力してください。");
    setStatus("Geminiで練習文を作成中...");
    const prompt = buildLessonPrompt({ ...state.settings, sourceText });
    state.lesson = await generateGeminiJson({
      apiKey: state.settings.geminiApiKey,
      model: state.settings.geminiModel,
      prompt,
    });
    state.evaluation = null;
    state.recording.transcript = "";
    setStatus("練習文を作成しました。");
    render();
  } catch (error) {
    setStatus(asMessage(error));
  }
}

async function handleSpeak() {
  try {
    if (!state.lesson?.targetText) throw new Error("先に練習文を作ってください。");
    updateSettings(readSettingsFromDom());
    if (state.settings.ttsProvider === "google") {
      setStatus("Google TTSで音声を作成中...");
      const url = await synthesizeWithGoogleTts({
        apiKey: state.settings.googleTtsApiKey,
        text: state.lesson.targetText,
        targetLanguage: state.settings.targetLanguage,
        voiceName: state.settings.ttsVoiceName,
        speakingRate: state.settings.ttsSpeakingRate,
        pitch: state.settings.ttsPitch,
      });
      new Audio(url).play();
    } else {
      speakWithBrowser({
        text: state.lesson.targetText,
        targetLanguage: state.settings.targetLanguage,
        speakingRate: state.settings.ttsSpeakingRate,
      });
    }
    setStatus("再生しています。");
  } catch (error) {
    setStatus(asMessage(error));
  }
}

async function handleToggleRecord() {
  try {
    await toggleRecording({
      onStarted: () => {
        setStatus("録音中...");
        const button = document.querySelector("#recordButton");
        if (button) button.textContent = "録音停止";
      },
      onStopped: (blob, mimeType) => {
        state.recording.blob = blob;
        state.recording.mimeType = mimeType;
        state.recording.transcript = "";
        setStatus(`録音しました: ${mimeType}`);
        render();
      },
    });
  } catch (error) {
    setStatus(asMessage(error));
  }
}

async function handleRecognize() {
  try {
    updateSettings(readSettingsFromDom());
    setStatus("AmiVoiceへ送信中...");
    const job = await createAmiVoiceJob({
      apiKey: state.settings.amivoiceApiKey,
      audioBlob: state.recording.blob,
      fileName: `practice.${state.recording.mimeType.includes("mp4") ? "mp4" : "webm"}`,
      settings: state.settings,
    });
    const sessionId = getAmiVoiceSessionId(job);
    if (!sessionId) throw new Error(formatAmiVoiceCreateError(job));
    setStatus("AmiVoiceで認識中...");
    const result = await pollAmiVoiceJob({
      apiKey: state.settings.amivoiceApiKey,
      sessionId,
      pollIntervalMs: state.settings.amivoicePollIntervalMs,
    });
    state.recording.transcript = extractTranscript(result) || "認識テキストを抽出できませんでした。";
    setStatus("認識が完了しました。");
    render();
  } catch (error) {
    setStatus(asMessage(error));
  }
}

async function handleEvaluate() {
  try {
    if (!state.lesson) throw new Error("先に練習文を作ってください。");
    if (!state.recording.transcript) throw new Error("先にAmiVoiceで認識してください。");
    updateSettings(readSettingsFromDom());
    setStatus("Geminiで発音を評価中...");
    const prompt = buildEvaluationPrompt({
      nativeLanguage: state.settings.nativeLanguage,
      targetLanguage: state.settings.targetLanguage,
      lesson: state.lesson,
      transcript: state.recording.transcript,
    });
    state.evaluation = await generateGeminiJson({
      apiKey: state.settings.geminiApiKey,
      model: state.settings.geminiModel,
      prompt,
    });
    pushHistory({
      title: state.lesson.title,
      targetText: state.lesson.targetText,
      score: state.evaluation.score,
      createdAt: new Date().toISOString(),
    });
    setStatus("評価しました。");
    render();
  } catch (error) {
    setStatus(asMessage(error));
  }
}

render();
