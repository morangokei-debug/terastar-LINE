-- Web Push 購読テーブル
-- ログインユーザーごとにブラウザの push subscription を保存する

CREATE TABLE IF NOT EXISTS terastar_line.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES terastar_line.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_tenant ON terastar_line.push_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON terastar_line.push_subscriptions(user_id);

-- 速度改善: チャット未読カウント用の部分インデックス
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread_patient
  ON terastar_line.chat_messages(tenant_id, patient_id)
  WHERE sender = 'patient' AND read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_patient_created
  ON terastar_line.chat_messages(patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follow_up_replies_tenant_replied
  ON terastar_line.follow_up_replies(tenant_id, replied_at DESC);
