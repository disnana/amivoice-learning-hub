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

読み方ガイドの品質ルール:
- readingGuideを雑なカタカナ1行だけで済ませないでください。
- readingGuideは「原文の区切り」「発音補助」「注意」を含む1つの文字列にしてください。
- カタカナ補助はあくまで補助です。実際の音に近づけるため、消えやすい音・つながる音・弱くなる音を短く説明してください。
- 英語の場合、語末の t, d, k, g, s, z などを勝手に完全削除しないでください。弱くなる場合は「弱くなる」「軽く添える」と説明してください。
- 英語の場合、justを「ジャス」だけで終わらせないでください。練習用には「ジャスト」、会話ではtが弱くなる場合がある、と説明してください。
- 英語の場合、outを「アウトゥ」と固定しないでください。「アウt」のように最後を短く添える説明を優先してください。
- headingのような -ing は、練習用には g の存在を意識させ、会話で弱くなる場合はその旨を説明してください。
- 強く発音する部分は **...** で囲んでください。ただしJSON文字列内の装飾として使い、Markdownの箇条書きやコードブロックは使わないでください。
- pronunciationTipsは、readingGuideの焼き直しではなく、改善行動が分かる具体的な注意にしてください。

readingGuideの例:
原文: I'm / just / heading / out
補助: アイム / **ジャスト** / ヘディン(グ) / **アウt**
注意: justのtは会話で弱くなりやすいが、練習ではまず軽く添える。outは「アウトゥ」と伸ばさず、最後を短く止める。

JSONだけで返してください。コードブロックは禁止です。
{
  "title": "短い練習タイトル",
  "targetText": "学習言語の自然な練習文。1文から3文。",
  "nativeMeaning": "母国語での意味",
  "readingGuide": "原文: ... / ...\\n補助: ... / ...\\n注意: ...",
  "pronunciationTips": ["発音注意点1", "発音注意点2", "発音注意点3"],
  "chunks": ["息継ぎや区切りごとの文字列"],
  "coachNote": "練習方針を短く",
  "nextVariation": "次に少し難しくするなら、という文",
  "items": [
    {
      "targetText": "候補文",
      "nativeMeaning": "母国語での意味",
      "readingGuide": "原文: ... / ...\\n補助: ... / ...\\n注意: ...",
      "pronunciationTips": ["短い注意点"],
      "chunks": ["区切り"]
    }
  ]
}
`.trim();
}
