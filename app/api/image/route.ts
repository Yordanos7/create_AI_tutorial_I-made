import { HfInference } from "@huggingface/inference";
import { NextResponse } from "next/server";

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const imageBlob = await hf.textToImage({
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      inputs: prompt,
    });

    // Return the image data directly with the correct content type
    return new Response(imageBlob, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "An error occurred in the route for image generation." },
      { status: 500 }
    );
  }
}
