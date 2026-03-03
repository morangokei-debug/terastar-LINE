# 調剤薬局LINEフォローアップサービス

LINE公式アカウントを使った、処方箋管理・フォローアップ・患者チャットのWebアプリです。

## ドキュメント

- **[要件定義書](docs/要件定義書.md)** … 機能一覧、技術仕様、実装フェーズ
- **[LINEセットアップ](docs/LINEセットアップ.md)** … 環境変数・Webhook URL の登録手順
- **[プロジェクト設定](docs/プロジェクト設定.md)** … Vercel・Supabase のURL、デプロイ手順
- **[Webhook URL登録手順](docs/Webhook_URL登録手順.md)** … デプロイ後のLINE連携手順

## 前提

- LINE公式アカウントはすでにある
- 患者のLINE紐付けはQRコードで行う
- 処方箋の原本は来局時に必要（事前送信は準備用途）

## 技術スタック

- Next.js 14 + Tailwind CSS
- LINE Messaging API（Webhook 受信済み）
- Supabase・Vercel（Phase 1 で追加予定）

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local に LINE_CHANNEL_SECRET 等を設定
npm run dev
```

## 次のステップ

1. Vercel にデプロイする
2. [LINEセットアップ](docs/LINEセットアップ.md) に従い、環境変数と Webhook URL を登録する
3. Phase 1（Supabase・認証・処方箋一覧）の実装を進める
