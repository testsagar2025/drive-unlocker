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
      1: `Analyze this screenshot and determine if it shows a successful registration completion on the ALLEN educational platform or similar affiliate platform.

Look for these SPECIFIC indicators of successful ALLEN registration:
- "Thank you for sharing your details" message
- "Our student advisor will reach out to you" message  
- Blue checkmark or success icon with celebration graphics
- ALLEN logo visible with confirmation content
- "Registration successful" or "Welcome" message
- Confirmation page showing the user completed signup
- Any success indicator after form submission

The screenshot should show a SUCCESS/CONFIRMATION screen, NOT the registration form itself.

Respond with ONLY a JSON object (no markdown, no code blocks):
{"verified": true, "reason": "Description of what you found"} 
OR
{"verified": false, "reason": "Why verification failed"}`,
      
      2: `Analyze this screenshot and determine if it shows the user has successfully joined a WhatsApp group or channel.

Look for these indicators:
- WhatsApp group chat interface visible
- Group name visible in the chat header
- "You joined using this group's invite link" system message
- Being inside a group chat (not just the invite/join page)
- Messages from other group members visible
- Group info showing membership status

The screenshot must show the user is INSIDE the group, not on the join invitation page.

Respond with ONLY a JSON object (no markdown, no code blocks):
{"verified": true, "reason": "Description of what you found"}
OR
{"verified": false, "reason": "Why verification failed"}`
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
