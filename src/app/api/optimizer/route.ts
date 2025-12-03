import { GoogleGenAI } from "@google/genai";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { emails, optimizations } from "@/lib/db/schema";
import { validateEtsyUrl } from "@/lib/utils";
import type { OptimizationResult, ProductDetails } from "@/types";
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

  // Get rate limit configuration from environment variables
  const maxOptimizationsPerDay = parseInt(
    process.env.MAX_OPTIMIZATIONS_PER_DAY || "5",
    10,
  );
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "salaheddine@zakadev.com";

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

    // Validate Etsy URL
    const urlValidation = validateEtsyUrl(url);
    if (!urlValidation.isValid) {
      return Response.json({ error: urlValidation.error }, { status: 400 });
    }

    // Check rate limit: count optimizations for this email today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOptimizations = await db
      .select({ count: sql<number>`count(*)` })
      .from(optimizations)
      .where(
        and(
          eq(optimizations.email, email),
          gte(optimizations.createdAt, startOfToday),
        ),
      );

    const todayCount = Number(todayOptimizations[0]?.count || 0);
    const remaining = maxOptimizationsPerDay - todayCount;

    // Check if limit exceeded
    if (todayCount >= maxOptimizationsPerDay) {
      return Response.json(
        {
          error: "Daily limit reached. Request more access:",
          rateLimitExceeded: true,
          contactEmail: contactEmail || "salaheddine@zakadev.com",
          remaining: 0,
          maxPerDay: maxOptimizationsPerDay,
        },
        { status: 429 },
      );
    }

    // Store email and name if not already stored
    try {
      await db.insert(emails).values({ email, name: name.trim() });
    } catch {
      // Ignore duplicate email errors (email already exists)
      // This is fine - we just want to collect emails, no verification needed
    }

    let details: ProductDetails;
    try {
      details = await extractProductDetails(url, ai);
      if (!details || !details.description || !details.title) {
        return Response.json(
          {
            error:
              "Couldn't fetch the listing. Please check the URL and try again.",
          },
          { status: 400 },
        );
      }
    } catch (error) {
      // Extract error message from extraction service
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Couldn't fetch the listing. Please try again.";
      return Response.json({ error: errorMessage }, { status: 400 });
    }
    let optimizationResult: OptimizationResult;
    try {
      optimizationResult = await generateOptimizedListing(
        details.description,
        ai,
      );
      if (!optimizationResult) {
        return Response.json(
          { error: "Optimization failed. Please retry." },
          { status: 500 },
        );
      }
    } catch (error) {
      // Extract error message from optimization service
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Optimization failed. Please retry.";
      return Response.json({ error: errorMessage }, { status: 500 });
    }

    // Record this optimization
    await db.insert(optimizations).values({ email });

    // Return result with rate limit info
    return Response.json(
      {
        ...optimizationResult,
        rateLimit: {
          remaining: remaining - 1,
          maxPerDay: maxOptimizationsPerDay,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected error in optimizer route:", error);
    // If it's already a structured error with a message, use it
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again.";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
