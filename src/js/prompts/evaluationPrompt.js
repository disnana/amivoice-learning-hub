export function buildEvaluationPrompt({ nativeLanguage, targetLanguage, lesson, transcript }) {
  return `
あなたは厳しすぎず具体的な発音コーチです。
母国語: ${nativeLanguage}
学習言語: ${targetLanguage}

正解文:
${lesson.targetText}

音声認識結果:
${transcript}

JSONだけで返してください。Markdownは禁止です。
{
  "score": 0から100の整数,
  "passed": true または false,
  "summary": "全体評価を母国語で短く",
  "goodPoints": ["良かった点"],
  "fixPoints": ["次に直す点。最大3つ"],
  "likelyPronunciationIssues": ["発音が原因で認識ズレした可能性"],
  "retryLine": "言い直し用の短い練習文",
  "nextAction": "次に何をするべきか"
}
`.trim();
}
