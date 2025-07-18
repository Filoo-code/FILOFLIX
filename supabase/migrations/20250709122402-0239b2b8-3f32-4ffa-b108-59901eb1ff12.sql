
-- Add download_url field to the content table
ALTER TABLE public.content 
ADD COLUMN download_url TEXT;
