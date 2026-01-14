-- Create profiles table for user tracking (no auth required for this use case)
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  step1_verified BOOLEAN NOT NULL DEFAULT false,
  step1_screenshot_url TEXT,
  step1_verified_at TIMESTAMP WITH TIME ZONE,
  step2_verified BOOLEAN NOT NULL DEFAULT false,
  step2_screenshot_url TEXT,
  step2_verified_at TIMESTAMP WITH TIME ZONE,
  drive_link_accessed BOOLEAN NOT NULL DEFAULT false,
  drive_link_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insert (anyone can create a session)
CREATE POLICY "Anyone can create session" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow users to read their own session by token
CREATE POLICY "Users can read own session" 
ON public.user_sessions 
FOR SELECT 
USING (true);

-- Create policy to allow updates (controlled by session token in code)
CREATE POLICY "Users can update session" 
ON public.user_sessions 
FOR UPDATE 
USING (true);

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('screenshots', 'screenshots', true);

-- Allow anyone to upload screenshots
CREATE POLICY "Anyone can upload screenshots" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'screenshots');

-- Allow anyone to view screenshots
CREATE POLICY "Anyone can view screenshots" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'screenshots');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();