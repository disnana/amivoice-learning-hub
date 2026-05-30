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
import { SetupWizard } from "./components/setupWizard.js";
import { STORAGE_KEY } from "./config/defaults.js";
import { toggleRecording, isRecording } from "./controllers/recorderController.js";
import { AMIVOICE_ENGINES } from "./data/models.js";
import { buildEvaluationPrompt } from "./prompts/evaluationPrompt.js";
import { buildLessonPrompt } from "./prompts/lessonPrompt.js";
import { pushHistory, state, updateSettings } from "./state/appState.js";
import { asMessage } from "./utils/errors.js";
import { setIconRoot } from "./utils/dom.js";
import { normalizeSpeechText } from "./utils/speechText.js";

const app = document.querySelector("#app");
let recordingIndex = null; // 現在どのインデックスのカードが録音中か
let currentAudio = null; // 現在再生中のオーディオオブジェクト (Google TTS用)
let isQueuePlaying = false; // 連続再生中かどうかのフラグ
let speechRecInstance = null; // ブラウザ内蔵音声認識インスタンス
let tempTranscript = ""; // 一時的な文字起こし文字列
let isBrowserSpeechRecActive = false; // ブラウザ音声認識がアクティブかどうかのフラグ

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
    googleTtsModelType: document.querySelector("#googleTtsModelType")?.value || state.settings.googleTtsModelType || "default",
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
    amivoiceDetailsOpen: document.querySelector("#amivoiceDetails")
      ? Boolean(document.querySelector("#amivoiceDetails").open)
      : state.settings.amivoiceDetailsOpen,
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
  // 再描画前にフォームの入力値を state に退避（DOM置換で消えるのを防ぐ）
  const currentSourceText = document.querySelector("#sourceText");
  if (currentSourceText) state.sourceText = currentSourceText.value;

  const activeItem = state.lesson?.items?.[state.activeLessonIndex] || null;
  const isAnyRec = isRecording() || isBrowserSpeechRecActive;
  const isRecThis = isAnyRec && recordingIndex === state.activeLessonIndex;

  const layoutEl = AppLayout({
    settingsPanel: SettingsPanel(state.settings, {
      onSave: () => {
        updateSettings(readSettingsFromDom());
        setStatus("設定を保存しました。");
        state.ui.settingsOpen = false;
        render();
      },
      onOptionChange: () => {
        // 設定画面ローカルでDOMがトグルされるため、全体再描画は不要。
      },
      onTtsProvider: (provider) => {
        // タブ切り替えもローカルで行われるため、全体再描画は不要。
      },
      onStartWizard: () => {
        state.ui ||= {};
        state.ui.wizardOpen = true;
        state.ui.settingsOpen = false;
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
      onSpeak: (text) => handleSpeak(text, state.activeLessonIndex),
      onToggleRecord: handleToggleRecord,
      onRecognize: handleRecognize,
      onEvaluate: handleEvaluate,
      onSpeedChange: (speed) => {
        state.settings.ttsSpeakingRate = speed;
        const slider = document.querySelector("#ttsSpeakingRate");
        if (slider) slider.value = speed;
        render();
      },
    }, {
      isAnyRecording: isAnyRec,
      isRecordingThis: isRecThis,
      ttsSpeakingRate: state.settings.ttsSpeakingRate,
    }),
    candidateList: CandidateList(state.lesson?.items, state.activeLessonIndex, {
      onSelect: (index) => {
        state.activeLessonIndex = index;
        render();
      },
      onSpeak: (text, index) => handleSpeak(text, index),
      onSpeakAll: handleSpeakAll,
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
  });

  if (state.ui?.wizardOpen) {
    const wizardEl = SetupWizard(state.settings, {
      onSave: (newSettings) => {
        updateSettings(newSettings);
        state.ui.wizardOpen = false;
        setStatus("セットアップが完了しました！");
        render();
      },
      onSkip: () => {
        updateSettings(state.settings);
        state.ui.wizardOpen = false;
        setStatus("セットアップをスキップしました（デモモード）。");
        render();
      }
    });
    app.replaceChildren(layoutEl, wizardEl);
  } else {
    app.replaceChildren(layoutEl);
  }
  setStatus(state.status);
  setIconRoot(app);
  // DOM置換後にフォームの入力値を復元
  const restoredSourceText = document.querySelector("#sourceText");
  if (restoredSourceText && state.sourceText) restoredSourceText.value = state.sourceText;
}

async function handleGenerateLesson() {
  try {
    // 生成前に最新の入力値を取得・保存
    const sourceTextEl = document.querySelector("#sourceText");
    if (sourceTextEl) state.sourceText = sourceTextEl.value;
    updateSettings(readSettingsFromDom());
    setStatus("Geminiで練習文を作成中...");
    const prompt = buildLessonPrompt({ ...state.settings, sourceText: state.sourceText.trim() });
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
        ttsAudioUrl: null,
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

async function handleSpeak(text, itemIndex, options = {}) {
  const { onEnd, keepQueue = false } = options;
  try {
    if (!keepQueue) {
      isQueuePlaying = false;
    }

    if (currentAudio) {
      try { currentAudio.pause(); } catch (e) {}
      currentAudio = null;
    }
    window.speechSynthesis.cancel();

    const activeIdx = typeof itemIndex === "number" ? itemIndex : state.activeLessonIndex;
    const item = state.lesson?.items?.[activeIdx];
    const speakText = normalizeSpeechText(typeof text === "string" ? text : item?.targetText);
    if (!speakText) throw new Error("再生するテキストがありません。");
    updateSettings(readSettingsFromDom());

    const targetSpeed = Number(state.settings.ttsSpeakingRate) || 1.0;

    if (state.settings.ttsProvider === "google") {
      const isTargetTextMatch = item && item.targetText === speakText;
      let url = isTargetTextMatch ? item.ttsAudioUrl : null;

      if (isTargetTextMatch && url) {
        setStatus("再生しています (キャッシュ)...");
      } else {
        setStatus("Google TTSで音声を作成中...");
        // 費用節約とキャッシュの汎用性のため、API側は常に 1.0 (等倍) でリクエストして生成する
        url = await synthesizeWithGoogleTts({
          apiKey: state.settings.googleTtsApiKey,
          text: speakText,
          targetLanguage: state.settings.targetLanguage,
          googleTtsModelType: state.settings.googleTtsModelType,
          voiceName: state.settings.ttsVoiceName,
          speakingRate: 1.0, // 常に 1.0 固定
          pitch: state.settings.ttsPitch,
        });

        if (isTargetTextMatch) {
          item.ttsAudioUrl = url;
        }
        setStatus("再生しています...");
      }

      const audio = new Audio(url);
      audio.playbackRate = targetSpeed;
      currentAudio = audio;

      const resetStatus = () => {
        if (currentAudio === audio) {
          setStatus("待機中");
          currentAudio = null;
          if (typeof onEnd === "function") onEnd();
        }
      };
      audio.addEventListener("ended", resetStatus);
      audio.addEventListener("error", resetStatus);
      audio.play();
    } else {
      setStatus("再生しています...");
      speakWithBrowser({
        text: speakText,
        targetLanguage: state.settings.targetLanguage,
        speakingRate: targetSpeed,
        onEnd: () => {
          setStatus("待機中");
          if (typeof onEnd === "function") onEnd();
        },
      });
    }
  } catch (error) {
    setStatus(asMessage(error));
    if (typeof onEnd === "function") onEnd();
  }
}

async function handleSpeakAll() {
  const items = state.lesson?.items || [];
  if (items.length === 0) return;

  isQueuePlaying = true;

  for (let i = 0; i < items.length; i++) {
    if (!isQueuePlaying) break;

    state.activeLessonIndex = i;
    render();

    await new Promise((resolve) => {
      handleSpeak(items[i].targetText, i, {
        keepQueue: true,
        onEnd: resolve,
      });
    });

    if (isQueuePlaying && i < items.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 600)); // 文間の少しの間隔
    }
  }

  isQueuePlaying = false;
}

async function handleToggleRecord() {
  const activeIdx = state.activeLessonIndex;
  const item = state.lesson?.items?.[activeIdx];
  if (!item) return;

  // AmiVoice APIキーがある場合は、従来のMediaRecorder録音処理
  if (state.settings.amivoiceApiKey) {
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
  // AmiVoice APIキーがない場合、ブラウザ音声認識(Web Speech API)を単独で起動（マイク競合を回避し、かつリアルタイム文字起こし）
  else {
    try {
      if (isBrowserSpeechRecActive) {
        // すでにブラウザ音声認識が起動している場合は、停止処理
        if (speechRecInstance) {
          try {
            speechRecInstance.stop();
          } catch (e) {}
          speechRecInstance = null;
        }
        isBrowserSpeechRecActive = false;
        recordingIndex = null;
        setStatus("ブラウザ音声認識を完了しました。");
        render();
      } else {
        // 新しくブラウザ音声認識を起動
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error("お使いのブラウザは音声認識API（SpeechRecognition）に対応していません。ChromeまたはEdgeをご利用ください。");
        }

        isBrowserSpeechRecActive = true;
        recordingIndex = activeIdx;
        const targetLang = state.settings.targetLanguage || "英語";
        setStatus(`音声認識中（ブラウザ内蔵）... ${targetLang}で喋ってください。`);
        render();

        speechRecInstance = new SpeechRecognition();
        speechRecInstance.lang = targetLang === "英語" ? "en-US" : (targetLang === "日本語" ? "ja-JP" : "en-US");
        speechRecInstance.continuous = false; // 一文練習に最適化し、Googleサーバーとの長時間コネクション切断エラー(network)を劇的に防止
        speechRecInstance.interimResults = true; // リアルタイム入力を滑らかにするため true に

        tempTranscript = "";

        speechRecInstance.onresult = (event) => {
          let interimTrans = "";
          let finalTrans = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTrans += event.results[i][0].transcript + " ";
            } else {
              interimTrans += event.results[i][0].transcript;
            }
          }
          const fullText = (tempTranscript + finalTrans + interimTrans).trim();
          
          if (state.lesson?.items?.[activeIdx]) {
            state.lesson.items[activeIdx].recording ||= { blob: null, mimeType: "" };
            state.lesson.items[activeIdx].recording.transcript = fullText;
            render(); // テキストエリアにリアルタイムでカタカタ入力されるように描画
          }
        };

        speechRecInstance.onerror = (e) => {
          console.error("SpeechRecognition error:", e);
          if (e.error === "not-allowed") {
            setStatus("マイクの使用が許可されていません。ブラウザのマイク権限を確認してください。");
          } else if (e.error === "network") {
            setStatus("ブラウザの音声認識サーバーとの接続でネットワークエラーが発生しました。再度お試しください。");
            if (state.lesson?.items?.[activeIdx]) {
              state.lesson.items[activeIdx].error = "音声認識サーバー一時エラー。もう一度お試しいただくか、Chromeブラウザの使用、またはAmiVoiceキーの登録をご検討ください。";
            }
          } else {
            setStatus(`音声認識エラー: ${e.error}`);
          }
          isBrowserSpeechRecActive = false;
          recordingIndex = null;
          render();
        };

        speechRecInstance.onend = () => {
          // 認識が終了したときのクリーンアップ
          isBrowserSpeechRecActive = false;
          recordingIndex = null;
          setStatus("音声認識が終了しました。そのまま評価へ進めます。");
          render();
        };

        speechRecInstance.start();
      }
    } catch (error) {
      isBrowserSpeechRecActive = false;
      recordingIndex = null;
      setStatus(asMessage(error));
      render();
    }
  }
}

async function handleRecognize() {
  const activeIdx = state.activeLessonIndex;
  const item = state.lesson?.items?.[activeIdx];
  if (!item || !item.recording?.blob) return;

  // AmiVoice APIキーがない場合の制御
  if (!state.settings.amivoiceApiKey) {
    if (item.recording?.transcript) {
      setStatus("すでにブラウザ内蔵の音声認識による文字起こしが完了しています。そのまま評価へ進めます。");
    } else {
      setStatus("AmiVoiceキーが未設定のため文字起こしを実行できません。録音時にブラウザで文字起こしするか、AmiVoiceキーを設定してください。");
    }
    return;
  }

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

const isFirstLaunch = !localStorage.getItem(STORAGE_KEY);
if (isFirstLaunch) {
  state.ui ||= {};
  state.ui.wizardOpen = true;
}

try {
  render();
} catch (error) {
  app.textContent = asMessage(error);
  console.error(error);
}
