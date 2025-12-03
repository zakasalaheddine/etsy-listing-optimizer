import { GoogleGenAI } from "@google/genai";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { emails, optimizations } from "@/lib/db/schema";
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

    const details = await extractProductDetails(url, ai);
    if (!details || !details.description || !details.title) {
      return Response.json(
        { error: "Could not extract product details from the URL." },
        { status: 400 },
      );
    }
    const optimizationResult = await generateOptimizedListing(
      details.description,
      ai,
    );
    if (!optimizationResult) {
      return Response.json(
        { error: "Could not generate optimized listing." },
        { status: 500 },
      );
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
    console.error(error);
    return Response.json(
      { error: "Error extracting product details" },
      { status: 500 },
    );
  }
}
