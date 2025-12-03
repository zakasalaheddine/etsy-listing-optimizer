import { type GoogleGenAI, Type } from "@google/genai";
import type { OptimizationResult } from "@/types";
import { OPTIMIZE_SYSTEM_PROMPT } from "./prompts";

export const generateOptimizedListing = async (
  productDetails: string,
  ai: GoogleGenAI,
): Promise<OptimizationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: productDetails,
      config: {
        systemInstruction: OPTIMIZE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productType: {
              type: Type.STRING,
              description:
                "A simple name for the product type, e.g. 'Custom Journal' or 'Wooden Chopping Board'.",
            },
            keywords: {
              type: Type.OBJECT,
              properties: {
                anchor: { type: Type.ARRAY, items: { type: Type.STRING } },
                descriptive: { type: Type.ARRAY, items: { type: Type.STRING } },
                who: { type: Type.ARRAY, items: { type: Type.STRING } },
                what: { type: Type.ARRAY, items: { type: Type.STRING } },
                where: { type: Type.ARRAY, items: { type: Type.STRING } },
                when: { type: Type.ARRAY, items: { type: Type.STRING } },
                why: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                "anchor",
                "descriptive",
                "who",
                "what",
                "where",
                "when",
                "why",
              ],
            },
            titles: {
              type: Type.ARRAY,
              description:
                "An array of 5 distinct, fully constructed, comma-separated product titles. Each must be 140 characters or less.",
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  score: {
                    type: Type.NUMBER,
                    description: "A score from 1-100 for the title's quality.",
                  },
                },
                required: ["text", "score"],
              },
            },
            tags: {
              type: Type.ARRAY,
              description:
                "An array of 30 distinct tag strings. Each must be 20 characters or less.",
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  score: {
                    type: Type.NUMBER,
                    description: "A score from 1-100 for the tag's quality.",
                  },
                },
                required: ["text", "score"],
              },
            },
          },
          required: ["productType", "keywords", "titles", "tags"],
        },
      },
    });

    const jsonString = response.text?.trim() ?? "";
    if (jsonString.startsWith("```json")) {
      const cleanedJson = jsonString.replace("```json", "").replace("```", "");
      return JSON.parse(cleanedJson) as OptimizationResult;
    }
    return JSON.parse(jsonString) as OptimizationResult;
  } catch (error) {
    console.error("Error generating optimized listing:", error);

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      // Check for network/API errors
      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        throw new Error(
          "Optimization failed due to network issues. Please retry.",
        );
      }

      // Check for JSON parsing errors
      if (error.message.includes("JSON") || error.message.includes("parse")) {
        throw new Error(
          "Optimization failed. The AI returned an unexpected format. Please retry.",
        );
      }

      // Check for rate limit or quota errors
      if (
        error.message.includes("quota") ||
        error.message.includes("rate limit")
      ) {
        throw new Error(
          "Optimization failed due to high demand. Please try again in a few moments.",
        );
      }
    }

    // Default error message
    throw new Error("Optimization failed. Please retry in a few moments.");
  }
};
