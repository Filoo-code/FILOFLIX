
-- Add missing columns to the content table
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS age_rating text;
