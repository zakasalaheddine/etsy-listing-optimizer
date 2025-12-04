/** biome-ignore-all lint/suspicious/noExplicitAny: Needed for AI response */
export interface RatedItem {
  text: string;
  score: number;
}

export interface Keywords {
  anchor: string[];
  descriptive: string[];
  who: string[];
  what: string[];
  where: string[];
  when: string[];
  why: string[];
}

export interface OptimizationResult {
  productType: string;
  keywords: Keywords;
  titles: RatedItem[];
  descriptions: RatedItem[];
  tags: RatedItem[];
  rateLimit?: {
    remaining: number;
    maxPerDay: number;
  };
}

export interface ProductDetails {
  title: string;
  description: string;
  tags: string[];
}

export interface TrademarkAnalysis {
  riskLevel: "Safe" | "Caution" | "High Risk";
  text: string;
  chunks: any[];
}
