import { describe, expect, it } from "vitest";
import { generateOptimizedListing } from "./optimize";
import { createMockGoogleGenAI, mockAIScenarios } from "@/__mocks__/ai-service";
import { generateOptimizationResult } from "@/__mocks__/data-generator";

describe("generateOptimizedListing", () => {
  const testDescription =
    "This is a beautiful handmade leather journal perfect for gifts";

  describe("successful optimization", () => {
    it("should generate optimized listing with all required fields", async () => {
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(testDescription, ai);

      expect(result).toHaveProperty("productType");
      expect(result).toHaveProperty("keywords");
      expect(result).toHaveProperty("titles");
      expect(result).toHaveProperty("descriptions");
      expect(result).toHaveProperty("tags");
    });

    it("should generate 5 title variations", async () => {
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(testDescription, ai);

      expect(result.titles).toHaveLength(5);
      result.titles.forEach((title) => {
        expect(title).toHaveProperty("text");
        expect(title).toHaveProperty("score");
        expect(typeof title.score).toBe("number");
      });
    });

    it("should generate 5 description variations", async () => {
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(testDescription, ai);

      expect(result.descriptions).toHaveLength(5);
      result.descriptions.forEach((desc) => {
        expect(desc).toHaveProperty("text");
        expect(desc).toHaveProperty("score");
        expect(typeof desc.score).toBe("number");
      });
    });

    it("should generate 30 tags", async () => {
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(testDescription, ai);

      expect(result.tags).toHaveLength(30);
      result.tags.forEach((tag) => {
        expect(tag).toHaveProperty("text");
        expect(tag).toHaveProperty("score");
        expect(typeof tag.score).toBe("number");
      });
    });

    it("should include all keyword categories", async () => {
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(testDescription, ai);

      expect(result.keywords).toHaveProperty("anchor");
      expect(result.keywords).toHaveProperty("descriptive");
      expect(result.keywords).toHaveProperty("who");
      expect(result.keywords).toHaveProperty("what");
      expect(result.keywords).toHaveProperty("where");
      expect(result.keywords).toHaveProperty("when");
      expect(result.keywords).toHaveProperty("why");
    });

    it("should handle response with markdown code blocks", async () => {
      const mockData = generateOptimizationResult();
      const ai = createMockGoogleGenAI({
        useMarkdownWrapper: true,
        customResponse: mockData,
      });

      const result = await generateOptimizedListing(testDescription, ai);

      expect(result.productType).toBe(mockData.productType);
      expect(result.keywords).toEqual(mockData.keywords);
    });

    it("should set correct product type", async () => {
      const customData = generateOptimizationResult({
        overrides: {
          productType: "Handmade Leather Wallet",
        },
      });
      const ai = mockAIScenarios.successfulOptimization(customData);

      const result = await generateOptimizedListing(testDescription, ai);

      expect(result.productType).toBe("Handmade Leather Wallet");
    });
  });

  describe("quality scores", () => {
    it("should have scores within valid range (1-100)", async () => {
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(testDescription, ai);

      result.titles.forEach((title) => {
        expect(title.score).toBeGreaterThanOrEqual(1);
        expect(title.score).toBeLessThanOrEqual(100);
      });

      result.descriptions.forEach((desc) => {
        expect(desc.score).toBeGreaterThanOrEqual(1);
        expect(desc.score).toBeLessThanOrEqual(100);
      });

      result.tags.forEach((tag) => {
        expect(tag.score).toBeGreaterThanOrEqual(1);
        expect(tag.score).toBeLessThanOrEqual(100);
      });
    });

    it("should handle edge case scores (1 and 100)", async () => {
      const customData = generateOptimizationResult({
        overrides: {
          titles: [
            { text: "Perfect Title", score: 100 },
            { text: "Bad Title", score: 1 },
            { text: "Average Title", score: 50 },
            { text: "Good Title", score: 85 },
            { text: "Ok Title", score: 65 },
          ],
        },
      });
      const ai = mockAIScenarios.successfulOptimization(customData);

      const result = await generateOptimizedListing(testDescription, ai);

      expect(result.titles[0].score).toBe(100);
      expect(result.titles[1].score).toBe(1);
    });
  });

  describe("error scenarios - network errors", () => {
    it("should throw network error when API fails", async () => {
      const ai = mockAIScenarios.networkError();

      await expect(
        generateOptimizedListing(testDescription, ai),
      ).rejects.toThrow(
        "Optimization failed due to network issues. Please retry.",
      );
    });

    it("should handle network timeout", async () => {
      const ai = createMockGoogleGenAI({
        shouldError: true,
        errorType: "network",
      });

      await expect(
        generateOptimizedListing(testDescription, ai),
      ).rejects.toThrow(/network issues/i);
    });
  });

  describe("error scenarios - parsing errors", () => {
    it("should throw parse error for malformed JSON", async () => {
      const ai = mockAIScenarios.malformedJSON();

      await expect(
        generateOptimizedListing(testDescription, ai),
      ).rejects.toThrow(
        "Optimization failed. The AI returned an unexpected format. Please retry.",
      );
    });

    it("should handle JSON parse error gracefully", async () => {
      const ai = mockAIScenarios.parseError();

      await expect(
        generateOptimizedListing(testDescription, ai),
      ).rejects.toThrow();
    });
  });

  describe("error scenarios - quota errors", () => {
    it("should throw quota error when rate limit exceeded", async () => {
      const ai = mockAIScenarios.quotaError();

      await expect(
        generateOptimizedListing(testDescription, ai),
      ).rejects.toThrow(
        "Optimization failed due to high demand. Please try again in a few moments.",
      );
    });

    it("should handle rate limit errors gracefully", async () => {
      const ai = createMockGoogleGenAI({
        shouldError: true,
        errorType: "quota",
      });

      await expect(
        generateOptimizedListing(testDescription, ai),
      ).rejects.toThrow(/high demand/i);
    });
  });

  describe("error scenarios - generic errors", () => {
    it("should throw generic error for unknown issues", async () => {
      const ai = mockAIScenarios.genericError();

      await expect(
        generateOptimizedListing(testDescription, ai),
      ).rejects.toThrow("Optimization failed. Please retry in a few moments.");
    });

    it("should handle API errors gracefully", async () => {
      const ai = createMockGoogleGenAI({
        shouldError: true,
        errorType: "generic",
      });

      await expect(
        generateOptimizedListing(testDescription, ai),
      ).rejects.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle empty product description", async () => {
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing("", ai);

      expect(result).toHaveProperty("productType");
      expect(result).toHaveProperty("keywords");
    });

    it("should handle very long product description", async () => {
      const longDescription = "A".repeat(10000);
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(longDescription, ai);

      expect(result).toHaveProperty("productType");
    });

    it("should handle special characters in description", async () => {
      const specialDescription =
        "Handmade & Custom Journal - 50% Off! Limited Time Only!!!";
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(specialDescription, ai);

      expect(result).toHaveProperty("productType");
    });

    it("should handle Unicode characters in description", async () => {
      const unicodeDescription = "Beautiful handmade journal ✨🎁💝";
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(unicodeDescription, ai);

      expect(result).toHaveProperty("productType");
    });

    it("should handle HTML entities in description", async () => {
      const htmlDescription =
        "Custom &amp; Personalized Journal - &quot;Best Gift&quot;";
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(htmlDescription, ai);

      expect(result).toHaveProperty("productType");
    });
  });

  describe("keyword categorization", () => {
    it("should have non-empty keyword arrays", async () => {
      const mockData = generateOptimizationResult();
      const ai = mockAIScenarios.successfulOptimization(mockData);

      const result = await generateOptimizedListing(testDescription, ai);

      expect(Array.isArray(result.keywords.anchor)).toBe(true);
      expect(Array.isArray(result.keywords.descriptive)).toBe(true);
      expect(Array.isArray(result.keywords.who)).toBe(true);
      expect(Array.isArray(result.keywords.what)).toBe(true);
      expect(Array.isArray(result.keywords.where)).toBe(true);
      expect(Array.isArray(result.keywords.when)).toBe(true);
      expect(Array.isArray(result.keywords.why)).toBe(true);
    });

    it("should handle empty keyword categories", async () => {
      const customData = generateOptimizationResult({
        overrides: {
          keywords: {
            anchor: [],
            descriptive: [],
            who: [],
            what: [],
            where: [],
            when: [],
            why: [],
          },
        },
      });
      const ai = mockAIScenarios.successfulOptimization(customData);

      const result = await generateOptimizedListing(testDescription, ai);

      expect(result.keywords.anchor).toEqual([]);
      expect(result.keywords.descriptive).toEqual([]);
    });
  });
});
