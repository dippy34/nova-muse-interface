const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

interface ImageResponse {
  text?: string;
  imageUrl?: string;
  error?: string;
}

export async function generateImage(prompt: string): Promise<ImageResponse> {
  try {
    const resp = await fetch(IMAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return { error: data.error || `Request failed with status ${resp.status}` };
    }

    return data;
  } catch (error) {
    console.error("Image generation error:", error);
    return { error: error instanceof Error ? error.message : "Failed to generate image" };
  }
}
