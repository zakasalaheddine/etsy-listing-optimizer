import { type GoogleGenAI, Type } from "@google/genai";
import type { ProductDetails } from "@/types";
import { EXTRACT_SYSTEM_PROMPT } from "./prompts";

export const extractProductDetails = async (
  url: string,
  ai: GoogleGenAI,
): Promise<ProductDetails> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: EXTRACT_SYSTEM_PROMPT(url),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The exact title of the listing.",
            },
            description: {
              type: Type.STRING,
              description:
                "A concise but comprehensive paragraph describing the product.",
            },
            tags: {
              type: Type.ARRAY,
              description: "The tags that are used in the product.",
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ["title", "description"],
        },
      },
    });

    const jsonString = response.text?.trim() ?? "";
    if (jsonString.startsWith("```json")) {
      const cleanedJson = jsonString.replace("```json", "").replace("```", "");
      return JSON.parse(cleanedJson) as ProductDetails;
    }
    return JSON.parse(jsonString) as ProductDetails;
  } catch (error) {
    console.error("Error extracting product details:", error);
    throw new Error(
      "Failed to analyze the provided URL. The content might be inaccessible.",
    );
  }
};
