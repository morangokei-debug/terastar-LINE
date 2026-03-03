-- テラスターLINE 初期スキーマ（terastar_line スキーマ使用・他アプリと競合回避）
-- マルチテナント対応: 全テーブルに tenant_id を含める

CREATE SCHEMA IF NOT EXISTS terastar_line;

-- tenants: 薬局（テナント）情報
CREATE TABLE IF NOT EXISTS terastar_line.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  line_channel_id TEXT,
  line_channel_access_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- patients: 患者
CREATE TABLE IF NOT EXISTS terastar_line.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES terastar_line.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  phone TEXT,
  line_user_id TEXT UNIQUE,
  linked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terastar_patients_tenant ON terastar_line.patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_terastar_patients_line_user ON terastar_line.patients(line_user_id);

-- prescriptions: 処方箋
CREATE TABLE IF NOT EXISTS terastar_line.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES terastar_line.tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES terastar_line.patients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'completed')),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  pharmacy_name TEXT,
  drug_names TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terastar_prescriptions_tenant ON terastar_line.prescriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_terastar_prescriptions_patient ON terastar_line.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_terastar_prescriptions_status ON terastar_line.prescriptions(status);

-- follow_up_patterns: フォロー日程パターン
CREATE TABLE IF NOT EXISTS terastar_line.follow_up_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES terastar_line.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  days_after INTEGER NOT NULL,
  message_template TEXT,
  reply_options JSONB DEFAULT '[]',
  reply_thank_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terastar_follow_up_patterns_tenant ON terastar_line.follow_up_patterns(tenant_id);

-- follow_up_schedules: フォロー送信予定
CREATE TABLE IF NOT EXISTS terastar_line.follow_up_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES terastar_line.tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES terastar_line.patients(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES terastar_line.follow_up_patterns(id) ON DELETE SET NULL,
  drug_names TEXT[],
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terastar_follow_up_schedules_tenant ON terastar_line.follow_up_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_terastar_follow_up_schedules_scheduled ON terastar_line.follow_up_schedules(scheduled_at) WHERE sent_at IS NULL;

-- follow_up_replies: 患者の返信
CREATE TABLE IF NOT EXISTS terastar_line.follow_up_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES terastar_line.tenants(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES terastar_line.follow_up_schedules(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES terastar_line.patients(id) ON DELETE CASCADE,
  reply_type TEXT,
  reply_text TEXT,
  replied_at TIMESTAMPTZ DEFAULT NOW(),
  checked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_terastar_follow_up_replies_tenant ON terastar_line.follow_up_replies(tenant_id);

-- chat_messages: チャット履歴
CREATE TABLE IF NOT EXISTS terastar_line.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES terastar_line.tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES terastar_line.patients(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('patient', 'pharmacist')),
  content TEXT NOT NULL,
  line_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terastar_chat_messages_tenant ON terastar_line.chat_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_terastar_chat_messages_patient ON terastar_line.chat_messages(patient_id);

-- RLS 有効化
ALTER TABLE terastar_line.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE terastar_line.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE terastar_line.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terastar_line.follow_up_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE terastar_line.follow_up_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE terastar_line.follow_up_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE terastar_line.chat_messages ENABLE ROW LEVEL SECURITY;

-- 初期テナント用ポリシー（Phase 1 では単一テナント想定、後で認証連携）
CREATE POLICY "Allow all for authenticated" ON terastar_line.tenants FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON terastar_line.patients FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON terastar_line.prescriptions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON terastar_line.follow_up_patterns FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON terastar_line.follow_up_schedules FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON terastar_line.follow_up_replies FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON terastar_line.chat_messages FOR ALL USING (true);

-- 初期テナント登録（既に1件以上あればスキップ）
INSERT INTO terastar_line.tenants (name)
SELECT 'テラスターファーマシー' WHERE NOT EXISTS (SELECT 1 FROM terastar_line.tenants LIMIT 1);
