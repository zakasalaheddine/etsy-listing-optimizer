/**
 * Mock Data Generator for E2E Tests
 * 
 * This module provides utilities to generate mock API responses for testing
 * without touching the actual database. All data is generated programmatically.
 */

import type { OptimizationResult } from "@/types";

export interface MockOptimizationOptions {
  /** Number of anchor keywords to generate */
  anchorKeywords?: number;
  /** Number of descriptive keywords to generate */
  descriptiveKeywords?: number;
  /** Number of who keywords to generate */
  whoKeywords?: number;
  /** Number of what keywords to generate */
  whatKeywords?: number;
  /** Number of where keywords to generate */
  whereKeywords?: number;
  /** Number of when keywords to generate */
  whenKeywords?: number;
  /** Number of why keywords to generate */
  whyKeywords?: number;
  /** Number of titles to generate */
  titleCount?: number;
  /** Number of descriptions to generate */
  descriptionCount?: number;
  /** Number of tags to generate (max 30) */
  tagCount?: number;
  /** Remaining optimizations count */
  remainingOptimizations?: number;
  /** Product type */
  productType?: string;
  /** Base score for titles (will vary) */
  baseTitleScore?: number;
  /** Base score for tags (will vary) */
  baseTagScore?: number;
}

const DEFAULT_ANCHOR_KEYWORDS = [
  "handmade",
  "custom",
  "personalized",
  "unique",
  "artisan",
  "vintage",
  "handcrafted",
  "bespoke",
];

const DEFAULT_DESCRIPTIVE_KEYWORDS = [
  "wooden",
  "vintage",
  "unique",
  "rustic",
  "modern",
  "elegant",
  "minimalist",
  "bohemian",
];

const DEFAULT_WHO_KEYWORDS = [
  "gift for mom",
  "anniversary gift",
  "wedding gift",
  "housewarming gift",
  "birthday present",
  "graduation gift",
];

const DEFAULT_WHAT_KEYWORDS = [
  "wall decor",
  "home accent",
  "decorative item",
  "art piece",
  "shelf decor",
  "table centerpiece",
];

const DEFAULT_WHERE_KEYWORDS = [
  "living room",
  "bedroom",
  "kitchen",
  "office",
  "dining room",
  "bathroom",
];

const DEFAULT_WHEN_KEYWORDS = [
  "christmas",
  "birthday",
  "anniversary",
  "wedding",
  "graduation",
  "housewarming",
];

const DEFAULT_WHY_KEYWORDS = [
  "sustainable",
  "eco-friendly",
  "durable",
  "affordable",
  "unique design",
  "handmade quality",
];

/**
 * Generates a mock optimization result with realistic data
 */
export function generateMockOptimizationResult(
  options: MockOptimizationOptions = {},
): OptimizationResult {
  const {
    anchorKeywords = 3,
    descriptiveKeywords = 3,
    whoKeywords = 2,
    whatKeywords = 2,
    whereKeywords = 2,
    whenKeywords = 2,
    whyKeywords = 2,
    titleCount = 5,
    descriptionCount = 3,
    tagCount = 10,
    remainingOptimizations = 4,
    productType = "Wall Decor",
    baseTitleScore = 90,
    baseTagScore = 90,
  } = options;

  // Generate keywords
  const keywords = {
    anchor: DEFAULT_ANCHOR_KEYWORDS.slice(0, anchorKeywords),
    descriptive: DEFAULT_DESCRIPTIVE_KEYWORDS.slice(0, descriptiveKeywords),
    who: DEFAULT_WHO_KEYWORDS.slice(0, whoKeywords),
    what: DEFAULT_WHAT_KEYWORDS.slice(0, whatKeywords),
    where: DEFAULT_WHERE_KEYWORDS.slice(0, whereKeywords),
    when: DEFAULT_WHEN_KEYWORDS.slice(0, whenKeywords),
    why: DEFAULT_WHY_KEYWORDS.slice(0, whyKeywords),
  };

  // Generate titles (max 140 chars)
  const titles = Array.from({ length: titleCount }, (_, i) => {
    const score = baseTitleScore - i * 2;
    const parts = [
      keywords.anchor[i % keywords.anchor.length],
      keywords.descriptive[i % keywords.descriptive.length],
      keywords.what[i % keywords.what.length],
      keywords.who[i % keywords.who.length],
    ];
    const text = parts
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    return {
      text: text.length > 140 ? text.substring(0, 137) + "..." : text,
      score: Math.max(0, score),
    };
  });

  // Generate descriptions
  const descriptions = Array.from({ length: descriptionCount }, (_, i) => {
    const score = baseTitleScore - i * 3;
    const text = `Beautiful ${keywords.descriptive[i % keywords.descriptive.length]} ${keywords.what[i % keywords.what.length]} perfect for ${keywords.where[i % keywords.where.length]}. ${keywords.why[i % keywords.why.length]} design that makes a great ${keywords.when[i % keywords.when.length]} gift.`;
    return {
      text,
      score: Math.max(0, score),
    };
  });

  // Generate tags (max 20 chars each, max 30 tags)
  const allKeywords = [
    ...keywords.anchor,
    ...keywords.descriptive,
    ...keywords.who,
    ...keywords.what,
    ...keywords.where,
    ...keywords.when,
    ...keywords.why,
  ];
  const tags = Array.from(
    { length: Math.min(tagCount, 30) },
    (_, i) => {
      const keyword = allKeywords[i % allKeywords.length];
      const text = keyword.length > 20 ? keyword.substring(0, 20) : keyword;
      const score = baseTagScore - i;
      return {
        text,
        score: Math.max(0, score),
      };
    },
  );

  return {
    productType,
    keywords,
    titles,
    descriptions,
    tags,
    rateLimit: {
      remaining: remainingOptimizations,
      maxPerDay: 5,
    },
  };
}

/**
 * Generates a mock error response
 */
export function generateMockErrorResponse(
  status: number,
  error: string,
  message?: string,
  additionalData?: Record<string, unknown>,
) {
  const baseResponse: Record<string, unknown> = {
    error,
    ...(message && { message }),
    ...additionalData,
  };

  // Add rate limit specific fields
  if (status === 429) {
    return {
      ...baseResponse,
      rateLimitExceeded: true,
      remaining: additionalData?.remaining ?? 0,
      maxPerDay: additionalData?.maxPerDay ?? 5,
      contactEmail: additionalData?.contactEmail ?? "support@example.com",
    };
  }

  return baseResponse;
}

/**
 * Generates a mock success response for /api/email
 */
export function generateMockEmailResponse(name: string, email: string) {
  return {
    name,
    email,
    id: Math.floor(Math.random() * 1000),
  };
}

/**
 * Generates edge case scenarios
 */
export const EdgeCaseGenerators = {
  /** Empty keyword categories */
  emptyKeywords: (): OptimizationResult => ({
    productType: "Test Product",
    keywords: {
      anchor: ["test"],
      descriptive: ["test"],
      who: [],
      what: [],
      where: [],
      when: [],
      why: [],
    },
    titles: [{ text: "Test Title", score: 90 }],
    descriptions: [{ text: "Test description", score: 90 }],
    tags: [{ text: "test", score: 90 }],
    rateLimit: { remaining: 4, maxPerDay: 5 },
  }),

  /** Maximum length title (140 chars) */
  maxLengthTitle: (): OptimizationResult =>
    generateMockOptimizationResult({
      titleCount: 1,
      tagCount: 1,
      anchorKeywords: 1,
      descriptiveKeywords: 1,
    }),

  /** Maximum number of tags (30) */
  maxTags: (): OptimizationResult =>
    generateMockOptimizationResult({
      tagCount: 30,
    }),

  /** Special characters in keywords */
  specialCharacters: (): OptimizationResult => ({
    productType: "Test Product",
    keywords: {
      anchor: ["hand-made", "eco&friendly", "mom's gift"],
      descriptive: ["wood/metal", "vintage+modern"],
      who: ["gift for mom & dad"],
      what: [],
      where: [],
      when: [],
      why: [],
    },
    titles: [{ text: "Hand-Made Mom's Gift", score: 90 }],
    descriptions: [{ text: "Test description", score: 90 }],
    tags: [
      { text: "hand-made", score: 95 },
      { text: "eco&friendly", score: 90 },
    ],
    rateLimit: { remaining: 4, maxPerDay: 5 },
  }),

  /** Zero scores */
  zeroScores: (): OptimizationResult => ({
    productType: "Test Product",
    keywords: {
      anchor: ["test"],
      descriptive: ["test"],
      who: [],
      what: [],
      where: [],
      when: [],
      why: [],
    },
    titles: [{ text: "Test", score: 0 }],
    descriptions: [{ text: "Test", score: 0 }],
    tags: [{ text: "test", score: 0 }],
    rateLimit: { remaining: 0, maxPerDay: 5 },
  }),

  /** Negative remaining optimizations */
  negativeRemaining: (): OptimizationResult =>
    generateMockOptimizationResult({
      remainingOptimizations: -1,
    }),
};

