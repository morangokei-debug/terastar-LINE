ALTER TABLE terastar_line.follow_up_patterns
  ADD COLUMN IF NOT EXISTS free_text_prompt TEXT;

COMMENT ON COLUMN terastar_line.follow_up_patterns.free_text_prompt IS '自由入力を促すメッセージ。NULLの場合は選択肢のみ';
