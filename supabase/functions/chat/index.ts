import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
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

// Extract text from image using OCR.space API
async function extractTextFromImage(base64Image: string): Promise<string> {
  const OCR_API_KEY = Deno.env.get("OCR_SPACE_API_KEY");
  if (!OCR_API_KEY) {
    console.error("OCR_SPACE_API_KEY not configured");
    return "[OCR not configured - cannot read image]";
  }

  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
    
    const formData = new FormData();
    formData.append("apikey", OCR_API_KEY);
    formData.append("base64Image", `data:image/png;base64,${base64Data}`);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2"); // More accurate engine

    console.log("Calling OCR.space API...");
    
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`OCR API error: ${response.status}`);
      return "[Failed to read image]";
    }

    const result = await response.json();
    console.log("OCR result:", JSON.stringify(result));

    if (result.IsErroredOnProcessing) {
      console.error("OCR processing error:", result.ErrorMessage);
      return `[OCR error: ${result.ErrorMessage || "Unknown error"}]`;
    }

    if (result.ParsedResults && result.ParsedResults.length > 0) {
      const text = result.ParsedResults.map((r: { ParsedText: string }) => r.ParsedText).join("\n").trim();
      if (text) {
        console.log("Extracted text:", text.substring(0, 100) + "...");
        return text;
      }
    }

    return "[No text found in image]";
  } catch (error) {
    console.error("OCR extraction error:", error);
    return "[Error reading image]";
  }
}

// Convert messages to API format with OCR for images
async function formatMessagesForAPI(messages: Message[]): Promise<Array<{ role: string; content: string }>> {
  const formattedMessages: Array<{ role: string; content: string }> = [];

  for (const msg of messages) {
    let textContent = typeof msg.content === "string" ? msg.content : "";
    
    // If there are images, extract text using OCR
    if (msg.images && msg.images.length > 0) {
      const ocrTexts: string[] = [];
      
      for (let i = 0; i < msg.images.length; i++) {
        console.log(`Processing image ${i + 1} of ${msg.images.length}`);
        const extractedText = await extractTextFromImage(msg.images[i]);
        ocrTexts.push(`[Image ${i + 1} content: ${extractedText}]`);
      }
      
      const imageContext = ocrTexts.join("\n");
      textContent = textContent ? `${imageContext}\n\n${textContent}` : imageContext;
    }
    
    formattedMessages.push({ role: msg.role, content: textContent });
  }

  return formattedMessages;
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

    // Format messages for the API (with OCR for images)
    console.log("Processing messages with OCR...");
    const formattedMessages = await formatMessagesForAPI(messages);
    console.log("Messages processed, calling DeepSeek...");

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
