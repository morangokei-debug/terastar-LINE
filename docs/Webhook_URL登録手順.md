# Webhook URL 登録手順

**本番URL**: https://terastar-line.vercel.app  
**Webhook URL**: https://terastar-line.vercel.app/api/line/webhook

デプロイが完了したら、以下の手順で LINE に Webhook URL を登録してください。

## 前提

- Vercel にデプロイ済み（例: `https://terastar-line.vercel.app`）
- 環境変数 `LINE_CHANNEL_SECRET` を Vercel に設定済み

---

## 手順

### 1. デプロイURLを確認

Vercel のプロジェクト → Deployments → 最新のデプロイの URL を確認。

例: `https://terastar-line-xxx.vercel.app`

### 2. Webhook URL を組み立てる

```
https://【あなたのVercelのURL】/api/line/webhook
```

例: `https://terastar-line-xxx.vercel.app/api/line/webhook`

### 3. LINE Official Account Manager で登録

1. [LINE Official Account Manager](https://manager.line.biz/) にログイン
2. テラスターファーマシー（@920bcvxk）を選択
3. **設定** → **Messaging API**
4. **Webhook URL** の入力欄に上記URLを貼り付け
5. **保存** をクリック

### 4. 接続確認

- **検証** ボタンがあればクリック
- 成功すると「Webhookの利用」が有効になる

### 5. 動作確認

1. LINE公式アカウントを友だち追加
2. 何かメッセージを送信
3. Vercel → プロジェクト → Logs で `[LINE] message:` のログが出ていればOK

---

## トラブルシューティング

| 現象 | 確認すること |
|------|-------------|
| 検証失敗 | `LINE_CHANNEL_SECRET` が Vercel に正しく設定されているか |
| メッセージが届かない | Webhookの利用がONか、デプロイが成功しているか |
| 401エラー | 署名検証失敗。Channel secret の値を再確認 |
