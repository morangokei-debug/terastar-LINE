# LINE セットアップ手順

Vercel にデプロイ後、以下の手順で LINE と連携します。

## 1. 環境変数の設定（Vercel）

Vercel のプロジェクト設定 → Environment Variables で以下を追加：

| 変数名 | 取得場所 | 説明 |
|--------|----------|------|
| `LINE_CHANNEL_ID` | LINE Official Account Manager または LINE Developers | チャネルID（例: 2009302628） |
| `LINE_CHANNEL_SECRET` | 上記 | チャネルシークレット |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers → Messaging API設定 | チャネルアクセストークン（長期） |

**重要**: Channel access token は LINE Developers の「Messaging API設定」タブで「発行」ボタンから取得。

## 2. Webhook URL の登録

デプロイ後のアプリURLが `https://xxx.vercel.app` の場合：

**LINE Official Account Manager**（[manager.line.biz](https://manager.line.biz)）:
- 設定 → Messaging API → Webhook URL に以下を入力
- `https://xxx.vercel.app/api/line/webhook`
- 「保存」をクリック
- 「検証」で接続確認

**または LINE Developers**（[developers.line.biz](https://developers.line.biz)）:
- チャネル → Messaging API設定 → Webhook URL に上記を入力

## 3. 動作確認

1. LINE公式アカウントを友だち追加
2. 何かメッセージを送信
3. Vercel の Function Logs で `[LINE] message:` のログが出力されていればOK
