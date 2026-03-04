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
