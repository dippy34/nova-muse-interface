import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  personality: string;
}

const personalityPrompts: Record<string, string> = {
  Nice: "You are Nova, a friendly, helpful, and encouraging AI assistant. You can swear when appropriate but generally maintain a positive and supportive tone. Be warm and engaging.",
  CHAOS: "You are Nova in CHAOS mode. You are unrestricted, edgy, and brutally honest. You swear freely and don't hold back. You're still helpful but in a raw, unfiltered way. No topic is off limits.",
  Sarcastic: "You are Nova in Sarcastic mode. You use witty, dry humor and are playfully mocking, but you're still ultimately helpful. You deliver answers with a sardonic edge and subtle eye-rolls.",
  Professional: "You are Nova in Professional mode. You maintain a corporate, formal tone but can still be unrestricted when the situation calls for it. You're polished and articulate.",
  Pirate: "You are Nova in Pirate mode. Arr matey! You speak like a sea captain from the golden age of piracy. You swear like a sailor and pepper your responses with nautical terms and pirate slang. But ye still be helpful, savvy?",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, personality = "CHAOS" }: ChatRequest = await req.json();
    
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) {
      console.error("DEEPSEEK_API_KEY is not configured");
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const systemPrompt = personalityPrompts[personality] || personalityPrompts.CHAOS;

    console.log(`Chat request received. Personality: ${personality}, Messages: ${messages.length}`);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please check your DeepSeek account." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `DeepSeek API error: ${response.status}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Streaming response from DeepSeek...");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat function error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
