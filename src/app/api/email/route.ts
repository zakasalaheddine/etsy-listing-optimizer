import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emails } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    // Store email and name in database
    const result = await db
      .insert(emails)
      .values({ name: name.trim(), email })
      .returning();

    const insertedEmail = result[0];
    if (!insertedEmail) {
      return NextResponse.json(
        { error: "Failed to store email" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        name: insertedEmail.name,
        email: insertedEmail.email,
        id: insertedEmail.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error storing email:", error);
    return NextResponse.json(
      { error: "Failed to store email" },
      { status: 500 },
    );
  }
}
