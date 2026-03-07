-- チャットで患者が送った画像のURLを保存
ALTER TABLE terastar_line.chat_messages
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- チャット画像用Storageバケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- 公開読み取りポリシー
DROP POLICY IF EXISTS "chat_images_public_read" ON storage.objects;
CREATE POLICY "chat_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-images');

-- サービスロールからのアップロード許可（Webhook用）
DROP POLICY IF EXISTS "chat_images_insert" ON storage.objects;
CREATE POLICY "chat_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-images');
