export const USE_CASES = [
  { id: "daily", label: "日常会話", tone: "自然で短めの会話表現" },
  { id: "travel", label: "旅行", tone: "現地でそのまま使える丁寧な表現" },
  { id: "interview", label: "面接", tone: "明確で落ち着いた自己表現" },
  { id: "presentation", label: "発表", tone: "聞き取りやすく論理的な表現" },
  { id: "aviation", label: "航空無線", tone: "短く、定型的で、曖昧さの少ない交信表現" },
  { id: "free", label: "自由", tone: "ユーザーの目的に合わせた表現" },
  { id: "custom", label: "カスタム", tone: "ユーザーが入力した用途に合わせた表現" },
];

export function findUseCase(id) {
  return USE_CASES.find((item) => item.id === id) || USE_CASES[0];
}
