import FirecrawlApp from "@mendable/firecrawl-js";
import type { ProductDetails } from "@/types";

export const extractProductDetails = async (
  url: string,
  firecrawlApiKey: string,
): Promise<ProductDetails> => {
  try {
    const app = new FirecrawlApp({ apiKey: firecrawlApiKey });

    const extractResult = await app.extract({
      urls: [url],
      prompt:
        "Extract the product details from this Etsy listing page. Include the complete title, full description, and all tags.",
      schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description:
              "The complete and full product title exactly as it appears on the page. Do NOT truncate, summarize, or shorten the title in any way. Include ALL words, characters, and punctuation from the original title.",
          },
          description: {
            type: "string",
            description:
              "A comprehensive description of the product, focusing on its function, material, size, customization options (if any), and intended audience/occasion. Include all relevant product details and specifications.",
          },
          tags: {
            type: "array",
            items: {
              type: "string",
            },
            description:
              "All tags/keywords that are associated with the product listing. Include all tags exactly as they appear, without modification.",
          },
        },
        required: ["title", "description"],
      },
    });

    if (!extractResult.success) {
      throw new Error(
        extractResult.error || "Failed to extract product details",
      );
    }

    // biome-ignore lint/suspicious/noExplicitAny: Firecrawl API response type
    let extractedData = extractResult.data as any;

    // Handle array response (when multiple URLs) or single object response
    if (Array.isArray(extractedData)) {
      extractedData = extractedData[0];
    }

    // Validate the extracted data
    if (!extractedData || typeof extractedData !== "object") {
      throw new Error("Invalid extraction result format");
    }

    const productDetails: ProductDetails = {
      title: extractedData.title || "",
      description: extractedData.description || "",
      tags: Array.isArray(extractedData.tags) ? extractedData.tags : [],
    };

    // Ensure we have the required fields
    if (!productDetails.title || !productDetails.description) {
      throw new Error(
        "Missing required fields: title and description are required",
      );
    }

    return productDetails;
  } catch (error) {
    console.error("Error extracting product details:", error);

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      // Check for network/fetch errors
      if (
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("ECONNREFUSED")
      ) {
        throw new Error(
          "Couldn't fetch the listing. Please check your internet connection and try again.",
        );
      }

      // Check for Firecrawl API errors
      if (
        error.message.includes("API key") ||
        error.message.includes("authentication")
      ) {
        throw new Error(
          "Configuration error. Please contact support if this persists.",
        );
      }

      // Check for timeout errors
      if (error.message.includes("timeout")) {
        throw new Error(
          "The request timed out. Please try again in a moment.",
        );
      }

      // Pass through specific error messages
      if (
        error.message.includes("Couldn't fetch") ||
        error.message.includes("Missing required fields")
      ) {
        throw error;
      }
    }

    // Default error message
    throw new Error(
      "Couldn't fetch the listing. Please check the URL and try again.",
    );
  }
};
