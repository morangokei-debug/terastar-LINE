# 残作業

## 実施済み

- ✅ `SUPABASE_SERVICE_ROLE_KEY` を .env.local に設定
- ✅ `prescription_requests` テーブルのマイグレーション実行
- ✅ `NEXT_PUBLIC_PHARMACY_HOMEPAGE_URL` を .env.local に追加
- ✅ `LINE_CHANNEL_ACCESS_TOKEN` を .env.local に設定
- ✅ `LINE_CHANNEL_SECRET` を .env.local に設定
- ✅ リッチメニューを設定（設定画面のボタンで実行済み）
- ✅ 一斉送信機能（ブロードキャスト/マルチキャスト）を実装
- ✅ フォロー送信のQuick Reply対応
- ✅ フォロー返信の確認画面を実装
- ✅ 返信後のお礼メッセージ自動送信を実装
- ✅ 処方箋の検索・フィルタを実装
- ✅ ダッシュボードを充実（未確認返信数・送信予定など）
- ✅ チャット未読バッジを実装
- ✅ チャットのリアルタイム更新を実装
- ✅ フォローアップパターンに返信後お礼メッセージ項目を追加
- ✅ 処方箋一覧の行リンクを追加

## 残作業（Supabase SQL Editor でSQL実行が必要）

以下のSQLを Supabase ダッシュボードの **SQL Editor** で実行してください。

1. [Supabase ダッシュボード](https://supabase.com/dashboard/project/qxlucyxzfyqpmypmbokd) にログイン
2. 左メニューから **SQL Editor** を選択
3. 以下のSQLを貼り付けて **Run** をクリック

```sql
-- chat_messages に read_at カラムを追加（薬剤師が確認した日時）
ALTER TABLE terastar_line.chat_messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_terastar_chat_messages_unread
ON terastar_line.chat_messages(patient_id)
WHERE sender = 'patient' AND read_at IS NULL;

-- Realtime を有効化（チャットのリアルタイム更新に必要）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'terastar_line'
    AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE terastar_line.chat_messages;
  END IF;
END $$;
```

実行後、「Success」と表示されればOKです。
