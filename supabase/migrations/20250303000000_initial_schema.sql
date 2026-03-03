-- テラスターLINE 初期スキーマ
-- マルチテナント対応: 全テーブルに tenant_id を含める

-- tenants: 薬局（テナント）情報
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  line_channel_id TEXT,
  line_channel_access_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- patients: 患者
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  phone TEXT,
  line_user_id TEXT UNIQUE,
  linked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patients_line_user ON patients(line_user_id);

-- prescriptions: 処方箋
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'completed')),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  pharmacy_name TEXT,
  drug_names TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_tenant ON prescriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

-- follow_up_patterns: フォロー日程パターン
CREATE TABLE IF NOT EXISTS follow_up_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  days_after INTEGER NOT NULL,
  message_template TEXT,
  reply_options JSONB DEFAULT '[]',
  reply_thank_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_up_patterns_tenant ON follow_up_patterns(tenant_id);

-- follow_up_schedules: フォロー送信予定
CREATE TABLE IF NOT EXISTS follow_up_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES follow_up_patterns(id) ON DELETE SET NULL,
  drug_names TEXT[],
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_up_schedules_tenant ON follow_up_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedules_scheduled ON follow_up_schedules(scheduled_at) WHERE sent_at IS NULL;

-- follow_up_replies: 患者の返信
CREATE TABLE IF NOT EXISTS follow_up_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES follow_up_schedules(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reply_type TEXT,
  reply_text TEXT,
  replied_at TIMESTAMPTZ DEFAULT NOW(),
  checked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_follow_up_replies_tenant ON follow_up_replies(tenant_id);

-- chat_messages: チャット履歴
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('patient', 'pharmacist')),
  content TEXT NOT NULL,
  line_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant ON chat_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_patient ON chat_messages(patient_id);

-- RLS 有効化
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 初期テナント用ポリシー（Phase 1 では単一テナント想定、後で認証連携）
CREATE POLICY "Allow all for authenticated" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON prescriptions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON follow_up_patterns FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON follow_up_schedules FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON follow_up_replies FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON chat_messages FOR ALL USING (true);
