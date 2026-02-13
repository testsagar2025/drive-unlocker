CREATE POLICY "Anyone can delete sessions"
ON public.user_sessions
FOR DELETE
USING (true);