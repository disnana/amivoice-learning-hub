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
import { CandidateList } from "./components/candidateList.js";
import { HistoryPanel } from "./components/historyPanel.js";
import { LessonForm } from "./components/lessonForm.js";
import { LessonOutput } from "./components/lessonOutput.js";
import { SettingsPanel } from "./components/settingsPanel.js";
import { toggleRecording, isRecording } from "./controllers/recorderController.js";
import { AMIVOICE_ENGINES } from "./data/models.js";
import { buildEvaluationPrompt } from "./prompts/evaluationPrompt.js";
import { buildLessonPrompt } from "./prompts/lessonPrompt.js";
import { pushHistory, state, updateSettings } from "./state/appState.js";
import { asMessage } from "./utils/errors.js";
import { setIconRoot } from "./utils/dom.js";

const app = document.querySelector("#app");
let recordingIndex = null; // 現在どのインデックスのカードが録音中か

function readSettingsFromDom() {
  const hasSettingsModal = Boolean(document.querySelector("#geminiApiKey"));
  const preset = document.querySelector("#amivoiceEnginePreset")?.value;
  const presetValue = AMIVOICE_ENGINES.find((engine) => engine.value === preset)?.value;
  const selectedGeminiModel = document.querySelector("#geminiModel")?.value || state.settings.geminiModel;
  const customGeminiModel = document.querySelector("#geminiModelCustom")?.value.trim();
  const lessonCountMode = document.querySelector("#lessonCountMode")?.value || state.settings.lessonCountMode || "3";
  const lessonCount = lessonCountMode === "custom"
    ? Number(document.querySelector("#lessonCountCustom")?.value || state.settings.lessonCount || 3)
    : Number(lessonCountMode);
  return {
    nativeLanguage: document.querySelector("#nativeLanguage")?.value || state.settings.nativeLanguage,
    targetLanguage: document.querySelector("#targetLanguage")?.value || state.settings.targetLanguage,
    useCase: document.querySelector("#useCase")?.value || state.settings.useCase,
    customUseCase: document.querySelector("#customUseCase")?.value || state.settings.customUseCase || "",
    lessonCount: Math.min(20, Math.max(1, Number.isFinite(lessonCount) ? lessonCount : 3)),
    lessonCountMode,
    geminiModel: hasSettingsModal
      ? (selectedGeminiModel === "custom" ? customGeminiModel || state.settings.geminiModel : selectedGeminiModel)
      : state.settings.geminiModel,
    geminiModelMode: hasSettingsModal
      ? (selectedGeminiModel === "custom" ? "custom" : "preset")
      : state.settings.geminiModelMode,
    geminiApiKey: document.querySelector("#geminiApiKey")?.value.trim() || state.settings.geminiApiKey || "",
    googleTtsApiKey: document.querySelector("#googleTtsApiKey")?.value.trim() || state.settings.googleTtsApiKey || "",
    ttsVoiceName: document.querySelector("#ttsVoiceName")?.value || state.settings.ttsVoiceName || "",
    amivoiceApiKey: document.querySelector("#amivoiceApiKey")?.value.trim() || state.settings.amivoiceApiKey || "",
    amivoiceEngine: hasSettingsModal
      ? (preset === "custom"
        ? document.querySelector("#amivoiceEngine")?.value || state.settings.amivoiceEngine || "-a2b-multi-general"
        : presetValue || "-a2b-multi-general")
      : state.settings.amivoiceEngine,
    amivoiceEngineMode: hasSettingsModal
      ? (preset === "custom" ? "custom" : "preset")
      : state.settings.amivoiceEngineMode,
    amivoiceLoggingOptOut: document.querySelector("#amivoiceLoggingOptOut")
      ? Boolean(document.querySelector("#amivoiceLoggingOptOut").checked)
      : state.settings.amivoiceLoggingOptOut,
    amivoiceUseRawParams: document.querySelector("#amivoiceUseRawParams")
      ? Boolean(document.querySelector("#amivoiceUseRawParams").checked)
      : state.settings.amivoiceUseRawParams,
    amivoiceRawParams: document.querySelector("#amivoiceRawParams")?.value || state.settings.amivoiceRawParams || "grammarFileNames=-a2b-multi-general loggingOptOut=True",
    amivoiceUseProfileWords: document.querySelector("#amivoiceUseProfileWords")
      ? Boolean(document.querySelector("#amivoiceUseProfileWords").checked)
      : state.settings.amivoiceUseProfileWords,
    amivoiceProfileWords: document.querySelector("#amivoiceProfileWords")?.value || state.settings.amivoiceProfileWords || "",
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
  const activeItem = state.lesson?.items?.[state.activeLessonIndex] || null;
  const isAnyRec = isRecording();
  const isRecThis = isAnyRec && recordingIndex === state.activeLessonIndex;

  app.replaceChildren(AppLayout({
    settingsPanel: SettingsPanel(state.settings, {
      onSave: () => {
        updateSettings(readSettingsFromDom());
        setStatus("設定を保存しました。");
        state.ui.settingsOpen = false;
        render();
      },
      onOptionChange: () => {
        updateSettings(readSettingsFromDom());
        render();
      },
      onTtsProvider: (provider) => {
        updateSettings({ ...readSettingsFromDom(), ttsProvider: provider });
        render();
      },
    }),
    lessonForm: LessonForm(state.settings, {
      onGenerate: handleGenerateLesson,
      onOptionChange: () => {
        updateSettings(readSettingsFromDom());
        render();
      },
    }),
    lessonOutput: LessonOutput(activeItem, {
      onSpeak: handleSpeak,
      onToggleRecord: handleToggleRecord,
      onRecognize: handleRecognize,
      onEvaluate: handleEvaluate,
    }, {
      isAnyRecording: isAnyRec,
      isRecordingThis: isRecThis,
    }),
    candidateList: CandidateList(state.lesson?.items, state.activeLessonIndex, {
      onSelect: (index) => {
        state.activeLessonIndex = index;
        render();
      },
      onSpeak: handleSpeak,
    }),
    historyPanel: HistoryPanel(state.history),
    settingsOpen: state.ui?.settingsOpen || false,
    onOpenSettings: () => {
      state.ui ||= {};
      state.ui.settingsOpen = true;
      render();
    },
    onCloseSettings: () => {
      state.ui ||= {};
      state.ui.settingsOpen = false;
      render();
    },
  }));
  setStatus(state.status);
  setIconRoot(app);
}

async function handleGenerateLesson() {
  try {
    updateSettings(readSettingsFromDom());
    const sourceText = document.querySelector("#sourceText")?.value.trim();
    setStatus("Geminiで練習文を作成中...");
    const prompt = buildLessonPrompt({ ...state.settings, sourceText });
    const lessonData = await generateGeminiJson({
      apiKey: state.settings.geminiApiKey,
      model: state.settings.geminiModel,
      prompt,
    });

    state.lesson = lessonData;
    
    // 各アイテムのステート初期化
    if (state.lesson) {
      if (!Array.isArray(state.lesson.items)) {
        state.lesson.items = [{
          targetText: state.lesson.targetText || "",
          nativeMeaning: state.lesson.nativeMeaning || "",
          readingGuide: state.lesson.readingGuide || "",
          chunks: state.lesson.chunks || [],
          pronunciationTips: state.lesson.pronunciationTips || [],
          coachNote: state.lesson.coachNote || "",
        }];
      }
      
      state.lesson.items = state.lesson.items.map((item) => ({
        ...item,
        recording: { blob: null, mimeType: "", transcript: "" },
        evaluation: null,
        status: "idle",
        error: "",
        title: item.title || state.lesson.title || "Practice",
      }));
    }

    state.activeLessonIndex = 0;
    recordingIndex = null;
    setStatus("練習文を作成しました。");
    render();
  } catch (error) {
    setStatus(asMessage(error));
  }
}

async function handleSpeak(text) {
  try {
    const speakText = typeof text === "string" ? text : state.lesson?.items?.[state.activeLessonIndex]?.targetText;
    if (!speakText) throw new Error("再生するテキストがありません。");
    updateSettings(readSettingsFromDom());
    if (state.settings.ttsProvider === "google") {
      setStatus("Google TTSで音声を作成中...");
      const url = await synthesizeWithGoogleTts({
        apiKey: state.settings.googleTtsApiKey,
        text: speakText,
        targetLanguage: state.settings.targetLanguage,
        voiceName: state.settings.ttsVoiceName,
        speakingRate: state.settings.ttsSpeakingRate,
        pitch: state.settings.ttsPitch,
      });
      new Audio(url).play();
    } else {
      speakWithBrowser({
        text: speakText,
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
  const activeIdx = state.activeLessonIndex;
  const item = state.lesson?.items?.[activeIdx];
  if (!item) return;

  try {
    const isAnyRec = isRecording();
    if (isAnyRec && recordingIndex !== activeIdx) {
      return; // 別のカードが録音中
    }

    await toggleRecording({
      onStarted: () => {
        recordingIndex = activeIdx;
        setStatus("録音中...");
        render();
      },
      onStopped: (blob, mimeType) => {
        if (state.lesson?.items?.[activeIdx]) {
          state.lesson.items[activeIdx].recording = {
            blob,
            mimeType,
            transcript: "",
          };
          state.lesson.items[activeIdx].status = "idle";
          state.lesson.items[activeIdx].error = "";
        }
        recordingIndex = null;
        setStatus(`録音しました: ${mimeType}`);
        render();
      },
    });
  } catch (error) {
    if (state.lesson?.items?.[activeIdx]) {
      state.lesson.items[activeIdx].error = asMessage(error);
    }
    recordingIndex = null;
    setStatus(asMessage(error));
    render();
  }
}

async function handleRecognize() {
  const activeIdx = state.activeLessonIndex;
  const item = state.lesson?.items?.[activeIdx];
  if (!item || !item.recording?.blob) return;

  try {
    updateSettings(readSettingsFromDom());
    item.status = "uploading";
    item.error = "";
    setStatus("AmiVoiceへ送信中...");
    render();

    const job = await createAmiVoiceJob({
      apiKey: state.settings.amivoiceApiKey,
      audioBlob: item.recording.blob,
      fileName: `practice.${item.recording.mimeType.includes("mp4") ? "mp4" : "webm"}`,
      settings: state.settings,
    });
    const sessionId = getAmiVoiceSessionId(job);
    if (!sessionId) throw new Error(formatAmiVoiceCreateError(job));

    if (state.lesson?.items?.[activeIdx]) {
      state.lesson.items[activeIdx].status = "uploading";
    }
    setStatus("AmiVoiceで認識中...");
    render();

    const result = await pollAmiVoiceJob({
      apiKey: state.settings.amivoiceApiKey,
      sessionId,
      pollIntervalMs: state.settings.amivoicePollIntervalMs,
    });

    if (state.lesson?.items?.[activeIdx]) {
      const targetItem = state.lesson.items[activeIdx];
      targetItem.recording.transcript = extractTranscript(result) || "認識テキストを抽出できませんでした。";
      targetItem.status = "idle";
      targetItem.error = "";
    }
    setStatus("認識が完了しました。");
    render();
  } catch (error) {
    if (state.lesson?.items?.[activeIdx]) {
      const targetItem = state.lesson.items[activeIdx];
      targetItem.status = "idle";
      targetItem.error = asMessage(error);
    }
    setStatus(asMessage(error));
    render();
  }
}

async function handleEvaluate() {
  const activeIdx = state.activeLessonIndex;
  const item = state.lesson?.items?.[activeIdx];
  if (!item || !item.recording?.transcript) return;

  try {
    updateSettings(readSettingsFromDom());
    item.status = "evaluating";
    item.error = "";
    setStatus("Geminiで発音を評価中...");
    render();

    const prompt = buildEvaluationPrompt({
      nativeLanguage: state.settings.nativeLanguage,
      targetLanguage: state.settings.targetLanguage,
      lesson: {
        title: item.title,
        targetText: item.targetText,
        nativeMeaning: item.nativeMeaning,
      },
      transcript: item.recording.transcript,
    });

    const evaluationResult = await generateGeminiJson({
      apiKey: state.settings.geminiApiKey,
      model: state.settings.geminiModel,
      prompt,
    });

    if (state.lesson?.items?.[activeIdx]) {
      const targetItem = state.lesson.items[activeIdx];
      targetItem.evaluation = evaluationResult;
      targetItem.status = "idle";
      targetItem.error = "";

      pushHistory({
        title: targetItem.title,
        targetText: targetItem.targetText,
        score: targetItem.evaluation.score,
        createdAt: new Date().toISOString(),
      });
    }

    setStatus("評価しました。");
    render();
  } catch (error) {
    if (state.lesson?.items?.[activeIdx]) {
      const targetItem = state.lesson.items[activeIdx];
      targetItem.status = "idle";
      targetItem.error = asMessage(error);
    }
    setStatus(asMessage(error));
    render();
  }
}

try {
  render();
} catch (error) {
  app.textContent = asMessage(error);
  console.error(error);
}
