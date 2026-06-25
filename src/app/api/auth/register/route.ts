import { NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Nama dan Email harus diisi" }, { status: 400 });
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const userId = "user-" + crypto.randomUUID().substring(0, 8);
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: email.toLowerCase(),
        name,
        username: null,
        avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? "1534528741775-53994a69daeb" : "1522075469751-3a6694fb2f61"}?w=150&auto=format&fit=crop&q=80`,
      })
      .returning();

    return NextResponse.json(user);
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
