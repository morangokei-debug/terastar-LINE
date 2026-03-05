-- prescription_requests に生年月日カラムを追加
ALTER TABLE terastar_line.prescription_requests
ADD COLUMN IF NOT EXISTS birth_date DATE;
