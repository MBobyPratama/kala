import { NextResponse } from "next/server";
import { db, clickLogs, items } from "@/db";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { itemId, platform } = await request.json();

    if (!itemId || !platform) {
      return NextResponse.json({ error: "ItemId dan Platform harus diisi" }, { status: 400 });
    }

    if (platform !== "Shopee" && platform !== "Tokopedia") {
      return NextResponse.json({ error: "Platform tidak didukung" }, { status: 400 });
    }

    // Check item existence
    const [item] = await db.select().from(items).where(eq(items.id, itemId));
    if (!item) {
      return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });
    }

    // Record click log and update click counter in a Drizzle Transaction
    const [clickLog, updatedItem] = await db.transaction(async (tx: any) => {
      const clickId = "click-" + crypto.randomUUID().substring(0, 8);
      
      const [log] = await tx
        .insert(clickLogs)
        .values({
          id: clickId,
          itemId,
          platform,
        })
        .returning();

      const [itemUpdate] = await tx
        .update(items)
        .set({ clicksCount: sql`${items.clicksCount} + 1` })
        .where(eq(items.id, itemId))
        .returning();

      return [log, itemUpdate];
    });

    return NextResponse.json({
      success: true,
      clickLog,
      clicksCount: updatedItem.clicksCount,
    });
  } catch (error) {
    console.error("Record click Drizzle API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
