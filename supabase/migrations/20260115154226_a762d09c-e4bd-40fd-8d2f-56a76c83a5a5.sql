-- Add student info columns to user_sessions
ALTER TABLE public.user_sessions 
ADD COLUMN student_name TEXT,
ADD COLUMN student_class TEXT,
ADD COLUMN student_mobile TEXT,
ADD COLUMN registration_completed BOOLEAN DEFAULT false,
ADD COLUMN registration_completed_at TIMESTAMP WITH TIME ZONE;

-- Create page_views table for analytics
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL DEFAULT '/',
  session_token TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert page views
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

-- Allow reading page views (for admin queries)
CREATE POLICY "Anyone can read page views"
ON public.page_views
FOR SELECT
USING (true);