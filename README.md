# PhrasePilot

母国語で入力した内容から、Geminiで学習文を作り、TTSで聞き、AmiVoiceのバッチ認識結果をGeminiで評価する静的Webアプリです。

## 使い方

```powershell
python -m http.server 5173
```

ブラウザで以下を開きます。

```text
http://127.0.0.1:5173
```

## API設定

- Geminiモデルの初期値は `gemini-flash-latest`
- Geminiモデルは候補から選択、または直接入力で変更可能
- モデル候補には `gemini-flash-lite-latest` も含めています
- Google TTSは `v1/text:synthesize` をAPIキー付きで試します
- Google TTSがブラウザ直呼びで通らない場合は、内蔵TTSを使います
- AmiVoiceは非同期HTTP API v2のバッチ認識を使います
- AmiVoiceの初期エンジンは `多言語E2E_汎用バッチ`、接続エンジン名は `-a2b-multi-general`
- AmiVoice送信パラメータの初期値は `grammarFileNames=-a2b-multi-general loggingOptOut=True`
- AmiVoiceの `loggingOptOut` は画面で切り替え可能
- AmiVoiceの `d` パラメータは、フォーム生成または直接指定を選択可能

## ファイル構成

```text
index.html
src/css/
src/js/api/
src/js/components/
src/js/config/
src/js/controllers/
src/js/data/
src/js/prompts/
src/js/state/
src/js/utils/
```

## 注意

APIキーはユーザーのブラウザ内に保存されます。個人利用やローカル利用を前提にしています。

ブラウザの録音形式は環境により `audio/webm;codecs=opus` などになります。AmiVoice側の対応形式に合わない場合は、録音形式や送信パラメータの調整が必要です。
