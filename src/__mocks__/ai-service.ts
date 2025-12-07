import type { GoogleGenAI } from "@google/genai";
import { vi } from "vitest";
import type { OptimizationResult, ProductDetails } from "@/types";
import {
  generateOptimizationResult,
  generateProductDetails,
} from "./data-generator";

/**
 * Configuration for mock AI responses
 */
export interface MockAIConfig {
  /**
   * Whether to wrap response in markdown code blocks
   */
  useMarkdownWrapper?: boolean;
  /**
   * Whether to simulate an error
   */
  shouldError?: boolean;
  /**
   * Type of error to simulate
   */
  errorType?: "network" | "parse" | "quota" | "generic";
  /**
   * Custom response data
   */
  customResponse?: ProductDetails | OptimizationResult;
  /**
   * Response delay in milliseconds
   */
  delay?: number;
}

/**
 * Creates a mock AI response with configurable behavior
 */
export function createMockAIResponse(
  data: ProductDetails | OptimizationResult,
  config?: MockAIConfig,
) {
  const jsonString = JSON.stringify(data);
  const responseText = config?.useMarkdownWrapper
    ? `\`\`\`json\n${jsonString}\n\`\`\``
    : jsonString;

  return {
    text: responseText,
  };
}

/**
 * Creates a mock GoogleGenAI instance
 */
export function createMockGoogleGenAI(config?: MockAIConfig): GoogleGenAI {
  const generateContent = vi.fn().mockImplementation(async (options) => {
    // Simulate delay if configured
    if (config?.delay) {
      await new Promise((resolve) => setTimeout(resolve, config.delay));
    }

    // Simulate error scenarios
    if (config?.shouldError) {
      const errorType = config.errorType || "network";

      if (errorType === "network") {
        throw new Error("fetch failed");
      }
      if (errorType === "parse") {
        throw new Error("JSON parse error");
      }
      if (errorType === "quota") {
        throw new Error("quota exceeded");
      }
      throw new Error("AI service error");
    }

    // Determine which model is being used based on the config
    const isExtractModel = options.model === "gemini-2.5-flash";

    // Return appropriate mock data
    if (config?.customResponse) {
      return createMockAIResponse(config.customResponse, config);
    }

    if (isExtractModel) {
      return createMockAIResponse(generateProductDetails(), config);
    }

    return createMockAIResponse(generateOptimizationResult(), config);
  });

  return {
    models: {
      generateContent,
    },
  } as unknown as GoogleGenAI;
}

/**
 * Mock GoogleGenAI class constructor
 */
export function mockGoogleGenAIConstructor(config?: MockAIConfig) {
  return vi.fn().mockImplementation(() => createMockGoogleGenAI(config));
}

/**
 * Predefined mock scenarios for common testing cases
 */
export const mockAIScenarios = {
  /**
   * Successful extraction scenario
   */
  successfulExtraction: (customData?: Partial<ProductDetails>) =>
    createMockGoogleGenAI({
      customResponse: generateProductDetails({
        overrides: customData,
      }) as ProductDetails,
    }),

  /**
   * Successful optimization scenario
   */
  successfulOptimization: (customData?: Partial<OptimizationResult>) =>
    createMockGoogleGenAI({
      customResponse: generateOptimizationResult({
        overrides: customData,
      }) as OptimizationResult,
    }),

  /**
   * Response with markdown wrapper
   */
  markdownWrappedResponse: () =>
    createMockGoogleGenAI({
      useMarkdownWrapper: true,
    }),

  /**
   * Network error scenario
   */
  networkError: () =>
    createMockGoogleGenAI({
      shouldError: true,
      errorType: "network",
    }),

  /**
   * Parse error scenario
   */
  parseError: () =>
    createMockGoogleGenAI({
      shouldError: true,
      errorType: "parse",
    }),

  /**
   * Quota exceeded scenario
   */
  quotaError: () =>
    createMockGoogleGenAI({
      shouldError: true,
      errorType: "quota",
    }),

  /**
   * Generic error scenario
   */
  genericError: () =>
    createMockGoogleGenAI({
      shouldError: true,
      errorType: "generic",
    }),

  /**
   * Slow response scenario (for timeout testing)
   */
  slowResponse: (delayMs = 5000) =>
    createMockGoogleGenAI({
      delay: delayMs,
    }),

  /**
   * Empty response scenario
   */
  emptyResponse: () =>
    createMockGoogleGenAI({
      customResponse: {
        title: "",
        description: "",
        tags: [],
      } as ProductDetails,
    }),

  /**
   * Malformed JSON response
   */
  malformedJSON: () => {
    const ai = createMockGoogleGenAI();
    ai.models.generateContent = vi.fn().mockResolvedValue({
      text: "{ invalid json }",
    });
    return ai;
  },
};

/**
 * Mock the @google/genai module
 */
export function mockGoogleGenAIModule(config?: MockAIConfig) {
  return vi.mock("@google/genai", () => ({
    GoogleGenAI: mockGoogleGenAIConstructor(config),
    Type: {
      STRING: "string",
      NUMBER: "number",
      OBJECT: "object",
      ARRAY: "array",
    },
  }));
}

/**
 * Helper to create mock AI client for testing
 */
export function createTestAIClient(
  scenario: keyof typeof mockAIScenarios,
  customConfig?: MockAIConfig,
): GoogleGenAI {
  const scenarioConfig = mockAIScenarios[scenario];
  if (typeof scenarioConfig === "function") {
    return scenarioConfig() as GoogleGenAI;
  }
  return createMockGoogleGenAI(customConfig);
}
