export const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-pro-latest",
];

export const AMIVOICE_ENGINES = [
  { label: "日本語E2E_汎用", value: "-a2-ja-general", language: "日本語", rate: "8k / 16k" },
  { label: "中国語E2E_汎用", value: "-a2-zh-general", language: "中国語", rate: "8k / 16k" },
  { label: "多言語E2E_汎用", value: "-a2-multi-general", language: "多言語", rate: "8k / 16k" },
  { label: "日本語E2E_汎用バッチ", value: "-a2b-ja-general", language: "日本語", rate: "8k / 16k" },
  { label: "中国語E2E_汎用バッチ", value: "-a2b-zh-general", language: "中国語", rate: "8k / 16k" },
  { label: "多言語E2E_汎用バッチ", value: "-a2b-multi-general", language: "多言語", rate: "8k / 16k" },
  { label: "カスタム入力", value: "custom" },
];
