-- terastar_line スキーマを Data API で利用可能にする
-- 既存の Exposed schemas に terastar_line を追加
-- ※ logicpharm, payledger 等が既にある場合は、下記を編集してから実行すること

-- 現在の設定を確認する場合: SELECT rolconfig FROM pg_roles WHERE rolname = 'authenticator';

ALTER ROLE authenticator SET pgrst.db_schemas = 'public, logicpharm, payledger, terastar_line';
