import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// The drive link is stored server-side only - never exposed in frontend code
const DRIVE_LINK = "https://drive.google.com/drive/folders/14X2CcwcGtVDfSvqaBqeotpn5hcNECL-i";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken } = await req.json();

    if (!sessionToken || typeof sessionToken !== "string" || sessionToken.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid session token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionToken)) {
      return new Response(
        JSON.stringify({ error: "Invalid session token format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Database configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if both steps are verified
    const { data: session, error: fetchError } = await supabase
      .from("user_sessions")
      .select("step1_verified, step2_verified")
      .eq("session_token", sessionToken)
      .maybeSingle();

    if (fetchError) {
      throw new Error("Failed to fetch session");
    }

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!session.step1_verified || !session.step2_verified) {
      return new Response(
        JSON.stringify({ 
          error: "Complete all verification steps first",
          step1_verified: session.step1_verified,
          step2_verified: session.step2_verified
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark that drive link was accessed
    await supabase
      .from("user_sessions")
      .update({ 
        drive_link_accessed: true, 
        drive_link_accessed_at: new Date().toISOString() 
      })
      .eq("session_token", sessionToken);

    return new Response(
      JSON.stringify({ 
        success: true,
        driveLink: DRIVE_LINK 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Get drive link error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
