-- 未紐付けLINEユーザー（友だち追加時に保存し、薬剤師が患者と紐付ける）
CREATE TABLE IF NOT EXISTS terastar_line.line_pending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES terastar_line.tenants(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, line_user_id)
);

CREATE INDEX IF NOT EXISTS idx_line_pending_tenant ON terastar_line.line_pending(tenant_id);
ALTER TABLE terastar_line.line_pending ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON terastar_line.line_pending FOR ALL USING (true);
