-- テナントにリッチメニューIDを保存（follow時にユーザーへ即時設定するため）
ALTER TABLE terastar_line.tenants
ADD COLUMN IF NOT EXISTS rich_menu_id TEXT;
