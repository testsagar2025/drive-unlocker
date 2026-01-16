import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SessionData {
  id: string;
  session_token: string;
  step1_verified: boolean;
  step2_verified: boolean;
  drive_link_accessed: boolean;
  student_name: string | null;
  student_class: string | null;
  student_mobile: string | null;
  student_email?: string | null;
  registration_completed: boolean;
  ip_address?: string | null;
  location?: string | null;
}

async function getIPInfo(): Promise<{ ip: string; location: string } | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      ip: data.ip || 'Unknown',
      location: `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Unknown'
    };
  } catch (err) {
    console.error("Failed to get IP info:", err);
    return null;
  }
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const trackPageView = async (sessionToken: string, ipAddress?: string) => {
    try {
      await supabase.from("page_views").insert({
        page_path: window.location.pathname,
        session_token: sessionToken,
        user_agent: navigator.userAgent,
        ip_address: ipAddress,
      });
    } catch (err) {
      console.error("Failed to track page view:", err);
    }
  };

  const getOrCreateSession = async () => {
    try {
      // Get IP and location info
      const ipInfo = await getIPInfo();
      
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
          // Update IP and location if changed
          const currentIp = (data as any).ip_address;
          const currentLocation = (data as any).location;
          if (ipInfo && (currentIp !== ipInfo.ip || currentLocation !== ipInfo.location)) {
            await supabase
              .from("user_sessions")
              .update({ 
                ip_address: ipInfo.ip, 
                location: ipInfo.location 
              } as any)
              .eq("session_token", token);
          }
          const sessionData: SessionData = {
            ...data,
            student_email: (data as any).student_email || null,
            ip_address: ipInfo?.ip || currentIp || null,
            location: ipInfo?.location || currentLocation || null
          };
          setSession(sessionData);
          trackPageView(token, ipInfo?.ip);
          setLoading(false);
          return;
        }
      }

      // Create new session
      token = crypto.randomUUID();
      const { data, error: insertError } = await supabase
        .from("user_sessions")
        .insert({ 
          session_token: token,
          ip_address: ipInfo?.ip,
          location: ipInfo?.location
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      localStorage.setItem("procbse_session_token", token);
      const newSessionData: SessionData = {
        ...data,
        student_email: (data as any).student_email || null,
        ip_address: ipInfo?.ip || null,
        location: ipInfo?.location || null
      };
      setSession(newSessionData);
      trackPageView(token, ipInfo?.ip);
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
      const refreshedData: SessionData = {
        ...data,
        student_email: (data as any).student_email || null,
        ip_address: (data as any).ip_address || null,
        location: (data as any).location || null
      };
      setSession(refreshedData);
    }
  };

  useEffect(() => {
    getOrCreateSession();
  }, []);

  return { session, loading, error, refreshSession };
}
