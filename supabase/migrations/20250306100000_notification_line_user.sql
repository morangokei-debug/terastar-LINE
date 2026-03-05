-- 処方箋受信時のLINE通知先
ALTER TABLE terastar_line.tenants
  ADD COLUMN IF NOT EXISTS notification_line_user_id TEXT;

-- 通知先登録用の一時トークン（設定画面で発行、LINEで「通知登録 コード」送信で登録）
ALTER TABLE terastar_line.tenants
  ADD COLUMN IF NOT EXISTS notification_register_token TEXT;

ALTER TABLE terastar_line.tenants
  ADD COLUMN IF NOT EXISTS notification_register_token_expires_at TIMESTAMPTZ;
