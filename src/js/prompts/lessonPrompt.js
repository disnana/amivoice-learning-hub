import { findUseCase } from "../data/useCases.js";

export function buildLessonPrompt({ nativeLanguage, targetLanguage, useCase, sourceText }) {
  const context = findUseCase(useCase);
  return `
あなたは発音指導が得意な言語コーチです。
ユーザーの母国語は「${nativeLanguage}」、学習言語は「${targetLanguage}」、用途は「${context.label}」です。
用途の方向性: ${context.tone}

ユーザーの入力:
${sourceText}

JSONだけで返してください。Markdownは禁止です。
{
  "title": "短い練習タイトル",
  "targetText": "学習言語の自然な練習文。1文から3文。",
  "nativeMeaning": "母国語での意味",
  "readingGuide": "読み仮名、カタカナ補助、または発音しやすい分解",
  "pronunciationTips": ["発音注意点1", "発音注意点2", "発音注意点3"],
  "chunks": ["息継ぎや区切りごとの文字列"],
  "coachNote": "練習方針を短く",
  "nextVariation": "次に少し難しくするなら、という文"
}
`.trim();
}
