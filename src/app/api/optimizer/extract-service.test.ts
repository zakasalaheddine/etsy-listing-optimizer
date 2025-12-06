import { describe, expect, it, beforeEach } from "vitest";
import { extractProductDetails } from "./extract-service";
import { createMockGoogleGenAI, mockAIScenarios } from "@/__mocks__/ai-service";
import { generateProductDetails, mockErrors } from "@/__mocks__/data-generator";

describe("extractProductDetails", () => {
  const testUrl = "https://www.etsy.com/listing/123456/test-product";

  describe("successful extraction", () => {
    it("should extract product details from a valid URL", async () => {
      const mockData = generateProductDetails();
      const ai = mockAIScenarios.successfulExtraction(mockData);

      const result = await extractProductDetails(testUrl, ai);

      expect(result).toEqual(mockData);
      expect(result.title).toBe(mockData.title);
      expect(result.description).toBe(mockData.description);
      expect(result.tags).toEqual(mockData.tags);
    });

    it("should handle response with markdown code blocks", async () => {
      const mockData = generateProductDetails({
        overrides: {
          title: "Custom Journal",
          description: "A beautiful handmade journal",
          tags: ["journal", "handmade"],
        },
      });
      const ai = createMockGoogleGenAI({
        useMarkdownWrapper: true,
        customResponse: mockData,
      });

      const result = await extractProductDetails(testUrl, ai);

      expect(result.title).toBe("Custom Journal");
      expect(result.description).toBe("A beautiful handmade journal");
      expect(result.tags).toEqual(["journal", "handmade"]);
    });

    it("should handle product with empty tags array", async () => {
      const mockData = generateProductDetails({
        overrides: {
          tags: [],
        },
      });
      const ai = mockAIScenarios.successfulExtraction(mockData);

      const result = await extractProductDetails(testUrl, ai);

      expect(result.tags).toEqual([]);
    });

    it("should handle product with many tags", async () => {
      const manyTags = Array.from({ length: 13 }, (_, i) => `tag${i + 1}`);
      const mockData = generateProductDetails({
        overrides: {
          tags: manyTags,
        },
      });
      const ai = mockAIScenarios.successfulExtraction(mockData);

      const result = await extractProductDetails(testUrl, ai);

      expect(result.tags).toHaveLength(13);
      expect(result.tags).toEqual(manyTags);
    });

    it("should handle product with special characters in title", async () => {
      const specialTitle = "Custom Journal - 50% Off! (Limited Time)";
      const mockData = generateProductDetails({
        overrides: {
          title: specialTitle,
        },
      });
      const ai = mockAIScenarios.successfulExtraction(mockData);

      const result = await extractProductDetails(testUrl, ai);

      expect(result.title).toBe(specialTitle);
    });

    it("should handle product with long description", async () => {
      const longDescription = "A".repeat(5000);
      const mockData = generateProductDetails({
        overrides: {
          description: longDescription,
        },
      });
      const ai = mockAIScenarios.successfulExtraction(mockData);

      const result = await extractProductDetails(testUrl, ai);

      expect(result.description).toBe(longDescription);
      expect(result.description.length).toBe(5000);
    });
  });

  describe("error scenarios - network errors", () => {
    it("should throw network error when fetch fails", async () => {
      const ai = mockAIScenarios.networkError();

      await expect(extractProductDetails(testUrl, ai)).rejects.toThrow(
        "Couldn't fetch the listing. Please check your internet connection and try again.",
      );
    });

    it("should handle network timeout", async () => {
      const ai = createMockGoogleGenAI({
        shouldError: true,
        errorType: "network",
      });

      await expect(extractProductDetails(testUrl, ai)).rejects.toThrow(
        /internet connection/i,
      );
    });
  });

  describe("error scenarios - parsing errors", () => {
    it("should throw parse error for malformed JSON", async () => {
      const ai = mockAIScenarios.malformedJSON();

      await expect(extractProductDetails(testUrl, ai)).rejects.toThrow(
        "Couldn't fetch the listing. The page format might have changed. Please try again.",
      );
    });

    it("should handle JSON parse error gracefully", async () => {
      const ai = mockAIScenarios.parseError();

      await expect(extractProductDetails(testUrl, ai)).rejects.toThrow();
    });
  });

  describe("error scenarios - generic errors", () => {
    it("should throw generic error for unknown issues", async () => {
      const ai = mockAIScenarios.genericError();

      await expect(extractProductDetails(testUrl, ai)).rejects.toThrow(
        "Couldn't fetch the listing. Please check the URL and try again.",
      );
    });

    it("should handle API errors gracefully", async () => {
      const ai = createMockGoogleGenAI({
        shouldError: true,
        errorType: "generic",
      });

      await expect(extractProductDetails(testUrl, ai)).rejects.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle empty title in response", async () => {
      const mockData = generateProductDetails({
        overrides: {
          title: "",
          description: "Valid description",
        },
      });
      const ai = mockAIScenarios.successfulExtraction(mockData);

      const result = await extractProductDetails(testUrl, ai);

      expect(result.title).toBe("");
      expect(result.description).toBe("Valid description");
    });

    it("should handle empty description in response", async () => {
      const mockData = generateProductDetails({
        overrides: {
          title: "Valid title",
          description: "",
        },
      });
      const ai = mockAIScenarios.successfulExtraction(mockData);

      const result = await extractProductDetails(testUrl, ai);

      expect(result.title).toBe("Valid title");
      expect(result.description).toBe("");
    });

    it("should handle whitespace-only content", async () => {
      const mockData = generateProductDetails({
        overrides: {
          title: "   ",
          description: "   ",
        },
      });
      const ai = mockAIScenarios.successfulExtraction(mockData);

      const result = await extractProductDetails(testUrl, ai);

      expect(result.title).toBe("   ");
      expect(result.description).toBe("   ");
    });

    it("should handle response with extra whitespace", async () => {
      const ai = createMockGoogleGenAI({
        customResponse: {
          title: "  Title with spaces  ",
          description: "  Description with spaces  ",
          tags: ["  tag1  ", "  tag2  "],
        },
      });

      const result = await extractProductDetails(testUrl, ai);

      expect(result.title).toBe("  Title with spaces  ");
      expect(result.description).toBe("  Description with spaces  ");
    });

    it("should handle Unicode characters in product details", async () => {
      const mockData = generateProductDetails({
        overrides: {
          title: "Custom Journal ✨🎁",
          description: "Beautiful handmade gift 💝",
          tags: ["gift", "✨special✨"],
        },
      });
      const ai = mockAIScenarios.successfulExtraction(mockData);

      const result = await extractProductDetails(testUrl, ai);

      expect(result.title).toContain("✨");
      expect(result.description).toContain("💝");
    });

    it("should handle HTML entities in product details", async () => {
      const mockData = generateProductDetails({
        overrides: {
          title: "Custom &amp; Personalized Journal",
          description: "A &quot;beautiful&quot; handmade item",
        },
      });
      const ai = mockAIScenarios.successfulExtraction(mockData);

      const result = await extractProductDetails(testUrl, ai);

      expect(result.title).toContain("&amp;");
      expect(result.description).toContain("&quot;");
    });
  });

  describe("different URL formats", () => {
    it("should extract from URL with query parameters", async () => {
      const mockData = generateProductDetails();
      const ai = mockAIScenarios.successfulExtraction(mockData);
      const urlWithParams =
        "https://www.etsy.com/listing/123456/product?ref=shop_home";

      const result = await extractProductDetails(urlWithParams, ai);

      expect(result).toEqual(mockData);
    });

    it("should extract from URL with hash", async () => {
      const mockData = generateProductDetails();
      const ai = mockAIScenarios.successfulExtraction(mockData);
      const urlWithHash = "https://www.etsy.com/listing/123456/product#reviews";

      const result = await extractProductDetails(urlWithHash, ai);

      expect(result).toEqual(mockData);
    });

    it("should extract from different Etsy subdomains", async () => {
      const mockData = generateProductDetails();
      const ai = mockAIScenarios.successfulExtraction(mockData);
      const urlWithSubdomain = "https://shop.etsy.com/listing/123456/product";

      const result = await extractProductDetails(urlWithSubdomain, ai);

      expect(result).toEqual(mockData);
    });
  });
});
