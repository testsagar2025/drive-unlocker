import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Server-side admin credentials - never exposed to client
const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "Admin@2026";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, username, password } = body;

    // Validate credentials server-side
    if (!username || !password || username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Database configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case "fetch": {
        // Fetch all sessions and page view count
        const [sessionsResult, viewsResult] = await Promise.all([
          supabase.from("user_sessions").select("*").order("created_at", { ascending: false }),
          supabase.from("page_views").select("*", { count: "exact", head: true }),
        ]);

        if (sessionsResult.error) throw sessionsResult.error;
        if (viewsResult.error) throw viewsResult.error;

        return new Response(
          JSON.stringify({
            sessions: sessionsResult.data,
            totalViews: viewsResult.count || 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete": {
        const { ids } = body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return new Response(
            JSON.stringify({ error: "No IDs provided" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate IDs are UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!ids.every((id: string) => uuidRegex.test(id))) {
          return new Response(
            JSON.stringify({ error: "Invalid ID format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await supabase
          .from("user_sessions")
          .delete()
          .in("id", ids);

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true, deleted: ids.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Admin API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
