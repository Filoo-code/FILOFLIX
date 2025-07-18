
-- Create a table for content (movies, series, trailers)
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('movie', 'series', 'trailer')),
  thumbnail TEXT,
  video_url TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  genre TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view content (since it's a public streaming site)
CREATE POLICY "Anyone can view content" 
  ON public.content 
  FOR SELECT 
  USING (true);

-- Create policy to allow only admins to manage content
CREATE POLICY "Only admins can manage content" 
  ON public.content 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );
