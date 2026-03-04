-- 処方箋リクエストに画像URLを追加
ALTER TABLE terastar_line.prescription_requests
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ストレージバケット（処方箋画像用）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescription-images',
  'prescription-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- バケットのRLSポリシー（処方箋画像バケット用）
DROP POLICY IF EXISTS "prescription_images_public_read" ON storage.objects;
CREATE POLICY "prescription_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'prescription-images');

DROP POLICY IF EXISTS "prescription_images_insert" ON storage.objects;
CREATE POLICY "prescription_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'prescription-images');
