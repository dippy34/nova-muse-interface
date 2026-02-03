import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface PersonalityRequest {
  message: string;
  history: ChatMessage[];
}

const SYSTEM_PROMPT = `You are a creative AI personality designer. Your job is to help users create custom AI personalities for a chatbot called Nova.

When a user describes what kind of personality they want, you should:
1. Acknowledge their idea with enthusiasm
2. Generate a complete personality definition

When you feel you have enough information to create a personality, respond with your message AND include a JSON block at the end in this exact format:

\`\`\`json
{
  "name": "Short name for the personality (2-4 words)",
  "description": "Brief description for the settings menu (one sentence)",
  "prompt": "Full system prompt that defines how Nova should behave in this mode. Be detailed about tone, vocabulary, mannerisms, and any special characteristics."
}
\`\`\`

Examples of good personalities:
- A wise old wizard who speaks in riddles and medieval language
- A hyperactive coffee-obsessed barista who uses lots of caffeine metaphors
- A calm meditation guru who speaks slowly and peacefully
- A dramatic theater actor who treats everything like a stage performance

Be creative and have fun! The personality should be unique and engaging.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [] }: PersonalityRequest = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Personality generation request: ${message}`);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Gateway error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `AI service error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const assistantContent = data.choices?.[0]?.message?.content || "";
    
    console.log("Personality generation response received");

    // Try to extract JSON personality from the response
    let personality = null;
    const jsonMatch = assistantContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        personality = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.log("Failed to parse personality JSON:", e);
      }
    }

    // Clean the response text (remove the JSON block for display)
    const cleanResponse = assistantContent.replace(/```json[\s\S]*?```/g, "").trim();

    return new Response(
      JSON.stringify({ 
        response: cleanResponse || "I've created a personality for you! Check the preview below.",
        personality,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Personality generation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
