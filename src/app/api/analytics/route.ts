import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { optimizations } from "@/lib/db/schema";

export async function GET() {
  try {
    const totalOptimizations = await db
      .select({ count: sql<number>`count(*)` })
      .from(optimizations);

    const totalCount = Number(
      (totalOptimizations[0] as { count?: number })?.count || 0,
    );

    return Response.json(
      {
        totalOptimizations: totalCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
