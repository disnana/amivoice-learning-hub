import { findUseCase } from "../data/useCases.js";

export function buildLessonPrompt({ nativeLanguage, targetLanguage, useCase, customUseCase, sourceText, lessonCount }) {
  const context = findUseCase(useCase);
  const effectiveUseCase = useCase === "custom" && customUseCase?.trim()
    ? customUseCase.trim()
    : context.label;
  const effectiveTone = useCase === "custom" && customUseCase?.trim()
    ? `カスタム用途: ${customUseCase.trim()}`
    : context.tone;
  const effectiveSourceText = sourceText?.trim() || "指定なし";
  return `
あなたは発音指導が得意な言語コーチです。
ユーザーの母国語は「${nativeLanguage}」、学習言語は「${targetLanguage}」、用途は「${effectiveUseCase}」です。
用途の方向性: ${effectiveTone}

ユーザーの入力:
${effectiveSourceText}

ユーザーの入力が「指定なし」の場合は、用途と言語に合った短い練習文をあなたが提案してください。
練習文は${lessonCount || 3}個作成してください。最初の1つをtargetTextに入れ、全体の候補をitemsに入れてください。

JSONだけで返してください。Markdownは禁止です。
{
  "title": "短い練習タイトル",
  "targetText": "学習言語の自然な練習文。1文から3文。",
  "nativeMeaning": "母国語での意味",
  "readingGuide": "読み仮名、カタカナ補助、または発音しやすい分解",
  "pronunciationTips": ["発音注意点1", "発音注意点2", "発音注意点3"],
  "chunks": ["息継ぎや区切りごとの文字列"],
  "coachNote": "練習方針を短く",
  "nextVariation": "次に少し難しくするなら、という文",
  "items": [
    {
      "targetText": "候補文",
      "nativeMeaning": "母国語での意味",
      "readingGuide": "読み方",
      "pronunciationTips": ["短い注意点"],
      "chunks": ["区切り"]
    }
  ]
}
`.trim();
}
