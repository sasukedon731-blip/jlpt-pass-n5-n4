# 日本語検定合格学習アプリ（JLPT N5 / N4）

N5 / N4 に特化した学習プラットフォームです。

## この版で反映した内容
- N5 / N4 専用のTOP導線
- N3 / N2 を公開対象から除外
- N5 の問題追加用プレースホルダー教材を維持
- ゲームを N5 / N4 用に再公開
- マイページ仕様は基本維持、バッジは少数精鋭へ整理
- 企業用管理画面をシンプルなダッシュボードに再設計

## 必要な環境変数
`.env.example` を見ながら設定してください。

### 必須
- Firebase client 一式
- Firebase Admin 一式

### 使うなら必要
- `OPENAI_API_KEY`
  - AI会話
  - スピーキング評価
  - TTS / 応答生成
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
  - 決済機能を使う場合

## 開発
```bash
npm install
npm run dev
```

## Vercel で別プロジェクトとして立ち上げる流れ
1. このフォルダを新しい GitHub リポジトリへ push
2. Vercel で **New Project** を選ぶ
3. その新リポジトリを接続
4. Environment Variables に `.env.example` の値を入れる
5. Deploy

## あとで用意してもらうとよいキー
- Firebase プロジェクト情報
- Firebase Admin サービスアカウント鍵
- OpenAI API key（AI会話や発話採点を使うなら）
- Stripe key / webhook secret（決済を使うなら）
