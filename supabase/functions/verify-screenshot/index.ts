import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken, stepNumber, screenshotBase64 } = await req.json();

    if (!sessionToken || !stepNumber || !screenshotBase64) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Define verification prompts for each step
    const verificationPrompts: Record<number, string> = {
      1: `You are verifying that a user has visited the ALLEN educational platform registration/payment page. Be LENIENT and approve if the screenshot is plausibly from the ALLEN website or app.

APPROVE (verified: true) if you see ANY of these:
- Any page from ALLEN website/app (allen.in, allendigital.in, or ALLEN branding)
- Payment page showing any amount (₹99, ₹0, etc.) with payment options
- Registration form with ALLEN logo (even if fields are empty or filled)
- OTP verification screen from ALLEN
- "Thank you", "Registration successful", "Welcome" confirmation page
- Any payment gateway (Razorpay, Paytm, etc.) triggered from ALLEN
- ALLEN course selection or dashboard page
- Any mobile app screen showing ALLEN branding
- Any page that mentions ALLEN, ALLEN Digital, or ALLEN Online

REJECT (verified: false) ONLY if:
- The screenshot is completely unrelated to ALLEN (e.g., a random website, blank screen)
- The image is too blurry/dark to identify anything

Be generous - if there's any reasonable indication the user visited ALLEN's platform, approve it.

Respond with ONLY a JSON object (no markdown, no code blocks):
{"verified": true, "reason": "Brief description"} OR {"verified": false, "reason": "Brief reason"}`,
      
      2: `You are verifying that a user has interacted with a WhatsApp group invitation. Be LENIENT and approve if the screenshot shows any WhatsApp group-related activity.

APPROVE (verified: true) if you see ANY of these:
- WhatsApp group chat with messages visible
- WhatsApp group info/details page
- "Request to join" button or "Request sent" / "Waiting for admin approval" message
- "Join group" button on a WhatsApp invite page
- WhatsApp group name visible (any group name is fine)
- "You joined using this group's invite link" system message
- Any WhatsApp interface showing group membership or invitation
- Group invite link preview in WhatsApp
- Screenshot showing a WhatsApp group with member names/messages
- "Cancel request" button (means they already requested to join)
- Any WhatsApp group-related screen

REJECT (verified: false) ONLY if:
- The screenshot is completely unrelated to WhatsApp
- The image is too blurry/dark to identify anything
- It shows a private chat, not a group

Be generous - any indication of WhatsApp group interaction should be approved.

Respond with ONLY a JSON object (no markdown, no code blocks):
{"verified": true, "reason": "Brief description"} OR {"verified": false, "reason": "Brief reason"}`
    };

    const prompt = verificationPrompts[stepNumber];
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Invalid step number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lovable AI to analyze the screenshot
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
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI Response:", aiContent);

    // Parse the AI response
    let verificationResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verificationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e, aiContent);
      verificationResult = { verified: false, reason: "Could not parse AI response" };
    }

    // If verified, update the database
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
        updateData.step1_screenshot_url = `screenshot_step1_${sessionToken}`;
      } else if (stepNumber === 2) {
        updateData.step2_verified = true;
        updateData.step2_verified_at = new Date().toISOString();
        updateData.step2_screenshot_url = `screenshot_step2_${sessionToken}`;
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
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
