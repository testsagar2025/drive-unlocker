import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SessionData {
  id: string;
  session_token: string;
  step1_verified: boolean;
  step2_verified: boolean;
  drive_link_accessed: boolean;
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getOrCreateSession = async () => {
    try {
      // Check for existing session token in localStorage
      let token = localStorage.getItem("procbse_session_token");

      if (token) {
        // Try to fetch existing session
        const { data, error: fetchError } = await supabase
          .from("user_sessions")
          .select("*")
          .eq("session_token", token)
          .single();

        if (data && !fetchError) {
          setSession(data as SessionData);
          setLoading(false);
          return;
        }
      }

      // Create new session
      token = crypto.randomUUID();
      const { data, error: insertError } = await supabase
        .from("user_sessions")
        .insert({ session_token: token })
        .select()
        .single();

      if (insertError) throw insertError;

      localStorage.setItem("procbse_session_token", token);
      setSession(data as SessionData);
    } catch (err) {
      console.error("Session error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize session");
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    const token = localStorage.getItem("procbse_session_token");
    if (!token) return;

    const { data, error: fetchError } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("session_token", token)
      .single();

    if (data && !fetchError) {
      setSession(data as SessionData);
    }
  };

  useEffect(() => {
    getOrCreateSession();
  }, []);

  return { session, loading, error, refreshSession };
}
