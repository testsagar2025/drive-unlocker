import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken, stepNumber, screenshotBase64 } = await req.json();

    // Input validation
    if (!sessionToken || typeof sessionToken !== "string" || sessionToken.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid session token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!stepNumber || (stepNumber !== 1 && stepNumber !== 2)) {
      return new Response(
        JSON.stringify({ error: "Invalid step number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!screenshotBase64 || typeof screenshotBase64 !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing screenshot" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate base64 image (max ~10MB base64)
    if (screenshotBase64.length > 14_000_000) {
      return new Response(
        JSON.stringify({ error: "Image too large" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate session token format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionToken)) {
      return new Response(
        JSON.stringify({ error: "Invalid session token format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const verificationPrompts: Record<number, string> = {
      1: `You are verifying that a user has visited the ALLEN educational platform registration/payment page. Be LENIENT and approve if the screenshot is plausibly from the ALLEN website or app.

APPROVE (verified: true) if you see ANY of these:
- Any page from ALLEN website/app (allen.in, allendigital.in, or ALLEN branding)
- Payment page showing any amount with payment options
- Registration form with ALLEN logo
- OTP verification screen from ALLEN
- "Thank you", "Registration successful", "Welcome" confirmation page
- Any payment gateway triggered from ALLEN
- ALLEN course selection or dashboard page
- Any mobile app screen showing ALLEN branding

REJECT (verified: false) ONLY if:
- The screenshot is completely unrelated to ALLEN
- The image is too blurry/dark to identify anything

Respond with ONLY a JSON object (no markdown, no code blocks):
{"verified": true, "reason": "Brief description"} OR {"verified": false, "reason": "Brief reason"}`,
      
      2: `You are verifying that a user has interacted with a WhatsApp group invitation. Be LENIENT.

APPROVE (verified: true) if you see ANY of these:
- WhatsApp group chat with messages visible
- WhatsApp group info/details page
- "Request to join" or "Request sent" / "Waiting for admin approval" message
- "Join group" button on a WhatsApp invite page
- WhatsApp group name visible
- Any WhatsApp interface showing group membership or invitation
- "Cancel request" button

REJECT (verified: false) ONLY if:
- The screenshot is completely unrelated to WhatsApp
- The image is too blurry/dark to identify anything
- It shows a private chat, not a group

Respond with ONLY a JSON object (no markdown, no code blocks):
{"verified": true, "reason": "Brief description"} OR {"verified": false, "reason": "Brief reason"}`
    };

    const prompt = verificationPrompts[stepNumber];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: screenshotBase64.startsWith("data:") 
                    ? screenshotBase64 
                    : `data:image/png;base64,${screenshotBase64}`
                }
              }
            ]
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI Gateway error:", aiResponse.status);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";

    let verificationResult;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verificationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      verificationResult = { verified: false, reason: "Could not parse AI response" };
    }

    if (verificationResult.verified) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Database configuration missing");
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const updateData: Record<string, any> = {};
      if (stepNumber === 1) {
        updateData.step1_verified = true;
        updateData.step1_verified_at = new Date().toISOString();
      } else if (stepNumber === 2) {
        updateData.step2_verified = true;
        updateData.step2_verified_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("user_sessions")
        .update(updateData)
        .eq("session_token", sessionToken);

      if (updateError) {
        console.error("Database update error:", updateError);
        throw new Error("Failed to update session");
      }
    }

    return new Response(
      JSON.stringify({
        verified: verificationResult.verified,
        reason: verificationResult.reason,
        step: stepNumber
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
