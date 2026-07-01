import { NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq, and, ne } from "drizzle-orm";

export async function PATCH(request: Request) {
  try {
    const { userId, username, avatar } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "UserId harus diisi" }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    if (username !== undefined) {
      const cleanUsername = username.trim().toLowerCase();
      const isValid = /^[a-z0-9_-]+$/.test(cleanUsername);

      if (!isValid) {
        return NextResponse.json(
          { error: "Username hanya boleh huruf kecil, angka, - dan _" },
          { status: 400 }
        );
      }

      // Check if username already taken
      const [existing] = await db
        .select()
        .from(users)
        .where(and(eq(users.username, cleanUsername), ne(users.id, userId)));

      if (existing) {
        return NextResponse.json({ error: "Username sudah terpakai" }, { status: 400 });
      }

      updates.username = cleanUsername;
    }

    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diubah" }, { status: 400 });
    }

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update User API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
