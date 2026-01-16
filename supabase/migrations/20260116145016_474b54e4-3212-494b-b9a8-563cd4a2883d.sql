-- Add unique constraint on mobile number to prevent duplicate registrations
CREATE UNIQUE INDEX IF NOT EXISTS unique_mobile_registration 
ON public.user_sessions (student_mobile) 
WHERE student_mobile IS NOT NULL AND registration_completed = true;