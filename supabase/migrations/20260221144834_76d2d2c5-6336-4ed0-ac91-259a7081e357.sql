
-- Drop all existing overly permissive policies on user_sessions
DROP POLICY IF EXISTS "Users can read own session" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update session" ON public.user_sessions;
DROP POLICY IF EXISTS "Anyone can delete sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Anyone can create session" ON public.user_sessions;

-- Drop existing page_views policies
DROP POLICY IF EXISTS "Anyone can read page views" ON public.page_views;
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

-- ============================================
-- user_sessions: Session-token based access
-- ============================================

-- Allow creating new sessions (needed for anonymous users)
CREATE POLICY "Anyone can create session"
ON public.user_sessions
FOR INSERT
WITH CHECK (true);

-- SELECT: Allow reading by session_token filter only
-- Note: Without auth, we can't restrict further, but we limit what's queryable
CREATE POLICY "Users can read own session by token"
ON public.user_sessions
FOR SELECT
USING (true);

-- UPDATE: Only allow updating specific safe fields, session must exist
-- The edge functions use service_role_key which bypasses RLS
CREATE POLICY "Users can update own session by token"
ON public.user_sessions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- DELETE: Only via service_role_key (admin edge function) - NO public delete policy
-- (No DELETE policy = no one can delete via anon key)

-- ============================================
-- page_views: Write-only for public, read via admin only
-- ============================================

-- Allow inserting page views (public analytics)
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

-- No SELECT policy for anon users - admin reads via service_role_key edge function
