import { GoogleGenAI } from "@google/genai";
import { db } from "@/lib/db";
import { emails } from "@/lib/db/schema";
import { extractProductDetails } from "./extract-service";
import { generateOptimizedListing } from "./optimize";

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "GEMINI_API_KEY is not set" },
      { status: 500 },
    );
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const { url, email, name } = await request.json();
    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }
    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    // Store email and name if not already stored
    try {
      await db.insert(emails).values({ email, name: name.trim() });
    } catch {
      // Ignore duplicate email errors (email already exists)
      // This is fine - we just want to collect emails, no verification needed
    }
    const details = await extractProductDetails(url, ai);
    if (!details || !details.description || !details.title) {
      return Response.json(
        { error: "Could not extract product details from the URL." },
        { status: 400 },
      );
    }
    const optimizationResult = await generateOptimizedListing(
      details.description,
      ai,
    );
    if (!optimizationResult) {
      return Response.json(
        { error: "Could not generate optimized listing." },
        { status: 500 },
      );
    }
    return Response.json(optimizationResult, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Error extracting product details" },
      { status: 500 },
    );
  }
}
