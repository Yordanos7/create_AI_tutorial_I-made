import { HfInference } from "@huggingface/inference";
import { NextResponse } from "next/server";

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: message }],
      max_tokens: 500,
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
