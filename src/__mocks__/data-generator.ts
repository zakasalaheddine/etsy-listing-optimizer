import type {
  Keywords,
  OptimizationResult,
  ProductDetails,
  RatedItem,
  TrademarkAnalysis,
} from "@/types";

/**
 * Configuration options for generating mock data
 */
export interface MockDataConfig {
  /**
   * Seed for deterministic generation (optional)
   */
  seed?: number;
  /**
   * Override specific values
   */
  overrides?: Record<string, unknown>;
}

/**
 * Generates a mock RatedItem with configurable text and score
 */
export function generateRatedItem(
  text?: string,
  score?: number,
  config?: MockDataConfig,
): RatedItem {
  const defaultText =
    text ||
    `Mock item ${config?.seed || Math.floor(Math.random() * 1000)}`;
  const defaultScore = score !== undefined ? score : 75 + Math.floor(Math.random() * 25);

  return {
    text: defaultText,
    score: defaultScore,
    ...(config?.overrides || {}),
  };
}

/**
 * Generates an array of mock RatedItems
 */
export function generateRatedItems(
  count: number,
  prefix: string,
  config?: MockDataConfig,
): RatedItem[] {
  return Array.from({ length: count }, (_, i) =>
    generateRatedItem(
      `${prefix} ${i + 1}`,
      70 + Math.floor(Math.random() * 30),
      { seed: i, ...config },
    ),
  );
}

/**
 * Generates mock Keywords with all categories
 */
export function generateKeywords(config?: MockDataConfig): Keywords {
  const base: Keywords = {
    anchor: ["handmade", "custom", "personalized"],
    descriptive: ["beautiful", "elegant", "premium"],
    who: ["gifts for women", "gifts for men", "for teachers"],
    what: ["journal", "notebook", "planner"],
    where: ["home decor", "office supplies", "bedroom"],
    when: ["birthday", "christmas", "anniversary"],
    why: ["unique gift", "special occasion", "memorable"],
    ...(config?.overrides || {}),
  };

  return base;
}

/**
 * Generates a mock ProductDetails object
 */
export function generateProductDetails(
  config?: MockDataConfig,
): ProductDetails {
  const base: ProductDetails = {
    title: "Handmade Custom Leather Journal - Personalized Gift",
    description:
      "This beautiful handmade leather journal is perfect for journaling, note-taking, or as a special gift. Made with premium materials and attention to detail. Each journal is carefully crafted to ensure quality and durability.",
    tags: [
      "journal",
      "handmade",
      "custom",
      "leather",
      "personalized",
      "gift",
      "notebook",
    ],
    ...(config?.overrides || {}),
  };

  return base;
}

/**
 * Generates a mock OptimizationResult with complete data structure
 */
export function generateOptimizationResult(
  config?: MockDataConfig,
): OptimizationResult {
  const base: OptimizationResult = {
    productType: "Custom Leather Journal",
    keywords: generateKeywords(config),
    titles: generateRatedItems(5, "Custom Leather Journal", config),
    descriptions: generateRatedItems(5, "Description", config),
    tags: generateRatedItems(30, "tag", config),
    rateLimit: {
      remaining: 4,
      maxPerDay: 5,
    },
    ...(config?.overrides || {}),
  };

  return base;
}

/**
 * Generates a mock TrademarkAnalysis result
 */
export function generateTrademarkAnalysis(
  riskLevel?: "Safe" | "Caution" | "High Risk",
  config?: MockDataConfig,
): TrademarkAnalysis {
  const level = riskLevel || "Safe";
  const base: TrademarkAnalysis = {
    riskLevel: level,
    text:
      level === "Safe"
        ? "No trademark issues detected."
        : level === "Caution"
          ? "Some potential trademark concerns found."
          : "High risk trademark violations detected.",
    chunks: [],
    ...(config?.overrides || {}),
  };

  return base;
}

/**
 * Generates mock database record data
 */
export function generateEmailRecord(config?: MockDataConfig) {
  return {
    id: config?.overrides?.id || "550e8400-e29b-41d4-a716-446655440000",
    name: config?.overrides?.name || "Test User",
    email: config?.overrides?.email || "test@example.com",
    createdAt: config?.overrides?.createdAt || new Date(),
    ...(config?.overrides || {}),
  };
}

export function generateOptimizationRecord(config?: MockDataConfig) {
  return {
    id: config?.overrides?.id || "550e8400-e29b-41d4-a716-446655440001",
    email: config?.overrides?.email || "test@example.com",
    createdAt: config?.overrides?.createdAt || new Date(),
    ...(config?.overrides || {}),
  };
}

/**
 * Error generation helpers for testing error scenarios
 */
export const mockErrors = {
  networkError: () => new Error("Connection failed. Please check your internet connection and try again."),

  parseError: () => new Error("Couldn't fetch the listing. The page format might have changed. Please try again."),

  validationError: (message = "Invalid input") => new Error(message),

  rateLimitError: (remaining = 0, maxPerDay = 5) => {
    const error = new Error("Daily limit reached. Request more access:");
    Object.assign(error, {
      rateLimitExceeded: true,
      contactEmail: "test@example.com",
      remaining,
      maxPerDay,
    });
    return error;
  },

  aiServiceError: (type: "quota" | "network" | "parse" = "network") => {
    if (type === "quota") {
      return new Error("Optimization failed due to high demand. Please try again in a few moments.");
    }
    if (type === "parse") {
      return new Error("Optimization failed. The AI returned an unexpected format. Please retry.");
    }
    return new Error("Optimization failed due to network issues. Please retry.");
  },

  databaseError: () => new Error("Database operation failed"),
};

/**
 * Utility to create variations of mock data for edge case testing
 */
export const mockVariations = {
  /**
   * Product details with missing/invalid data
   */
  invalidProductDetails: (): Partial<ProductDetails> => ({
    title: "",
    description: "",
    tags: [],
  }),

  /**
   * Product details with extremely long content
   */
  longProductDetails: (): ProductDetails => ({
    title: "A".repeat(200),
    description: "B".repeat(10000),
    tags: Array.from({ length: 100 }, (_, i) => `tag${i}`),
  }),

  /**
   * Optimization result with edge case scores
   */
  edgeCaseScores: (): OptimizationResult => ({
    ...generateOptimizationResult(),
    titles: [
      generateRatedItem("Perfect Title", 100),
      generateRatedItem("Terrible Title", 1),
      generateRatedItem("Average Title", 50),
      generateRatedItem("Good Title", 85),
      generateRatedItem("Bad Title", 15),
    ],
    tags: generateRatedItems(30, "tag").map((tag, i) => ({
      ...tag,
      score: i % 3 === 0 ? 100 : i % 3 === 1 ? 1 : 50,
    })),
  }),

  /**
   * Rate limit scenarios
   */
  rateLimitScenarios: () => ({
    noLimit: { remaining: 5, maxPerDay: 5 },
    oneRemaining: { remaining: 1, maxPerDay: 5 },
    limitReached: { remaining: 0, maxPerDay: 5 },
    customLimit: (remaining: number, maxPerDay: number) => ({
      remaining,
      maxPerDay,
    }),
  }),
};
