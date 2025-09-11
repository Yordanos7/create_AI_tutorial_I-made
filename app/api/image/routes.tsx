import { HfInference } from "@huggingface/inference";
import { NextResponse } from "next/server";

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await hf.textToImage({
      model: "runwayml/stable-diffusion-v1-5",
      inputs: prompt,
      options: { wait_for_model: true },
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred in the route for image generation" },
      { status: 500 }
    );
  }
}
