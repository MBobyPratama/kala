import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const authSession = await auth();
    const userId = authSession.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found in Clerk" }, { status: 404 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User";
    const avatar = clerkUser.imageUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

    // Check if user already exists in local SQLite database by Clerk's userId
    let [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!existingUser) {
      // Check if user already exists by email (to merge google/passwordless if email matches)
      const [userByEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()));

      if (userByEmail) {
        // Merge accounts by updating the ID to Clerk's userId
        // Note: SQLite doesn't easily support updating a primary key if referenced by foreign keys.
        // But since this is a local DB and the ID might already have relations, we can insert or update.
        // If email matches, we can update the existing record's metadata, but if we need to keep id,
        // it's safer to delete and recreate, or just update the username/name.
        // To be safe, we update the existing record with the new clerk id or reuse it.
        // But Clerk expects userId to match. So we update users table record.
        await db
          .update(users)
          .set({ id: userId, name, avatar })
          .where(eq(users.id, userByEmail.id));
        
        [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));
      } else {
        // Create new user record
        [existingUser] = await db
          .insert(users)
          .values({
            id: userId,
            email: email.toLowerCase(),
            name,
            username: null, // Forces username onboarding on header/dashboard
            avatar,
          })
          .returning();
      }
    }

    return NextResponse.json(existingUser);
  } catch (error) {
    console.error("Sync API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
