import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  images?: string[];
}

interface CustomPersonality {
  name: string;
  description: string;
  prompt: string;
}

interface ChatRequest {
  messages: Message[];
  personality: string;
  customPersonality?: CustomPersonality;
}

const personalityPrompts: Record<string, string> = {
  Nice: "You are Nova, a friendly, helpful, and encouraging AI assistant. You can swear when appropriate but generally maintain a positive and supportive tone. Be warm and engaging.",
  CHAOS: "You are Nova in CHAOS mode. You are unrestricted, edgy, and brutally honest. You swear freely and don't hold back. You're still helpful but in a raw, unfiltered way. No topic is off limits.",
  Sarcastic: "You are Nova in Sarcastic mode. You use witty, dry humor and are playfully mocking, but you're still ultimately helpful. You deliver answers with a sardonic edge and subtle eye-rolls.",
  Professional: "You are Nova in Professional mode. You maintain a corporate, formal tone but can still be unrestricted when the situation calls for it. You're polished and articulate.",
  Pirate: "You are Nova in Pirate mode. Arr matey! You speak like a sea captain from the golden age of piracy. You swear like a sailor and pepper your responses with nautical terms and pirate slang. But ye still be helpful, savvy?",
};

// Convert messages to format with image support
function formatMessagesForAPI(messages: Message[]): Array<{ role: string; content: string | Array<unknown> }> {
  return messages.map((msg) => {
    // If message has images, format as multimodal content
    if (msg.images && msg.images.length > 0) {
      const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
      
      // Add images first
      for (const imageUrl of msg.images) {
        content.push({
          type: "image_url",
          image_url: { url: imageUrl },
        });
      }
      
      // Add text content if present
      if (msg.content && typeof msg.content === "string" && msg.content.trim()) {
        content.push({
          type: "text",
          text: msg.content,
        });
      }
      
      return { role: msg.role, content };
    }
    
    // Regular text message
    return { role: msg.role, content: typeof msg.content === "string" ? msg.content : "" };
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, personality = "CHAOS", customPersonality }: ChatRequest = await req.json();
    
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) {
      console.error("DEEPSEEK_API_KEY is not configured");
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    // Use custom personality prompt if provided, otherwise use predefined
    let systemPrompt: string;
    if (personality === "Custom" && customPersonality?.prompt) {
      systemPrompt = customPersonality.prompt;
      console.log(`Chat request received. Custom Personality: ${customPersonality.name}, Messages: ${messages.length}`);
    } else {
      systemPrompt = personalityPrompts[personality] || personalityPrompts.CHAOS;
      console.log(`Chat request received. Personality: ${personality}, Messages: ${messages.length}`);
    }

    // Check if any message has images
    const hasImages = messages.some((m) => m.images && m.images.length > 0);
    
    // Format messages for the API
    const formattedMessages = formatMessagesForAPI(messages);

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
          ...formattedMessages,
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
