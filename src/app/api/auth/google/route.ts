import { NextResponse } from "next/server";
import { db, users } from "@/db";
import crypto from "crypto";

export async function POST() {
  try {
    const randomSuffix = crypto.randomUUID().substring(0, 5);
    const mockEmail = `google.user.${randomSuffix}@gmail.com`;

    const userId = "google-" + crypto.randomUUID().substring(0, 8);
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: mockEmail,
        name: `Google User ${randomSuffix.toUpperCase()}`,
        username: null,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      })
      .returning();

    return NextResponse.json(user);
  } catch (error) {
    console.error("Google Mock API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
