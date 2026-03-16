-- チャット一覧を高速化するための集約ビュー
-- 一覧表示に必要な「最新メッセージ」と「未読件数」のみを取得できるようにする

CREATE INDEX IF NOT EXISTS idx_terastar_chat_messages_tenant_patient_created
ON terastar_line.chat_messages(tenant_id, patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_terastar_chat_messages_tenant_patient_unread
ON terastar_line.chat_messages(tenant_id, patient_id)
WHERE sender = 'patient' AND read_at IS NULL;

CREATE OR REPLACE VIEW terastar_line.chat_patient_summaries AS
WITH latest AS (
  SELECT DISTINCT ON (tenant_id, patient_id)
    tenant_id,
    patient_id,
    sender AS last_sender,
    content AS last_content,
    created_at AS last_created_at
  FROM terastar_line.chat_messages
  ORDER BY tenant_id, patient_id, created_at DESC
),
unread AS (
  SELECT
    tenant_id,
    patient_id,
    COUNT(*)::INT AS unread_count
  FROM terastar_line.chat_messages
  WHERE sender = 'patient' AND read_at IS NULL
  GROUP BY tenant_id, patient_id
)
SELECT
  latest.tenant_id,
  latest.patient_id,
  latest.last_sender,
  latest.last_content,
  latest.last_created_at,
  COALESCE(unread.unread_count, 0)::INT AS unread_count
FROM latest
LEFT JOIN unread
  ON unread.tenant_id = latest.tenant_id
 AND unread.patient_id = latest.patient_id;
