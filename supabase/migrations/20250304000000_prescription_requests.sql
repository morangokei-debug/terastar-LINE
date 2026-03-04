-- 患者からの処方箋送信リクエスト（リッチメニュー経由、紐付け前）
CREATE TABLE IF NOT EXISTS terastar_line.prescription_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES terastar_line.tenants(id) ON DELETE CASCADE,
  line_user_id TEXT,
  patient_name TEXT NOT NULL,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terastar_prescription_requests_tenant ON terastar_line.prescription_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_terastar_prescription_requests_created ON terastar_line.prescription_requests(created_at DESC);

ALTER TABLE terastar_line.prescription_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON terastar_line.prescription_requests FOR ALL USING (true);
