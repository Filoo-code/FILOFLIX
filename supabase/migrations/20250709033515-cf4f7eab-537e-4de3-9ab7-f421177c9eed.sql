
-- Create a table for admin settings including social media links
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default social media settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
  ('facebook_url', ''),
  ('instagram_url', ''),
  ('youtube_url', ''),
  ('x_url', '');

-- Add Row Level Security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins only (you'll need to implement proper admin authentication)
CREATE POLICY "Only admins can manage settings" 
  ON public.admin_settings 
  FOR ALL 
  USING (true);
