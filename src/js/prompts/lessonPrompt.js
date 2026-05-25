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
練習文は合計${lessonCount || 3}個作成し、そのすべて（1つ目の候補も含む）を items 配列に入れてください。また、items配列の最初の要素と同じ内容を、親オブジェクトの targetText, nativeMeaning, readingGuide, chunks, pronunciationTips にも設定してください。

JSONだけで返してください。Markdownは禁止です。
{
  "title": "短い練習タイトル",
  "targetText": "学習言語の自然な練習文。1文から3文。",
  "nativeMeaning": "母国語での意味",
  "readingGuide": "ユーザーの母国語（${nativeLanguage}）に合わせた読み方のガイド。例えば母国語が日本語の場合、英語などの学習言語の発音をカタカナ表記でガイドしてください。必ず発音のまとまり（音節や単語）ごとに '/' で区切ってください。また、アクセント（強調・高低）がある箇所や、強く発音すべき部分を必ず '**太字**' (Markdownの太字表記) で囲んで強調してください。 (例: 英語を日本語で練習する場合のカタカナ表記なら '**サ**ウ/ンズ/グッ/**ド**', 日本語を練習する場合ならピッチの上がる部分を '**お**/**は**/よ/う')",
  "pronunciationTips": ["発音注意点1", "発音注意点2", "発音注意点3"],
  "chunks": ["息継ぎや区切りごとの文字列"],
  "coachNote": "練習方針を短く",
  "nextVariation": "次に少し難しくするなら、という文",
  "items": [
    {
      "targetText": "候補文",
      "nativeMeaning": "母国語での意味",
      "readingGuide": "ユーザーの母国語に合わせた読み方。上記と同様に、必ず '/' で音節・単語を区切り、強調・アクセント部分を '**太字**' で囲んでください。",
      "pronunciationTips": ["短い注意点"],
      "chunks": ["区切り"]
    }
  ]
}
`.trim();
}
