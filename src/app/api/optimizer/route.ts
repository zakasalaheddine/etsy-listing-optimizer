import { GoogleGenAI } from "@google/genai";
import { extractProductDetails } from "./extract-service";

export async function POST(request: Request) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const { url } = await request.json();
    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }
    const details = await extractProductDetails(url, ai);
    return Response.json(details, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Error extracting product details" },
      { status: 500 },
    );
  }
}
