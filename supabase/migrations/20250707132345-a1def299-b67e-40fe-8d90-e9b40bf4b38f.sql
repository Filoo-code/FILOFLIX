
-- Create a storage bucket for cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('cover-images', 'cover-images', true);

-- Create policy to allow anyone to view cover images
CREATE POLICY "Anyone can view cover images"
ON storage.objects FOR SELECT
USING (bucket_id = 'cover-images');

-- Create policy to allow uploads to cover images bucket
CREATE POLICY "Allow cover image uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cover-images');

-- Create policy to allow updates to cover images
CREATE POLICY "Allow cover image updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cover-images');

-- Create policy to allow deleting cover images
CREATE POLICY "Allow cover image deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'cover-images');
