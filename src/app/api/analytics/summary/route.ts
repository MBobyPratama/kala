import { NextResponse } from "next/server";
import { db, items, users, clickLogs } from "@/db";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json({ error: "SellerId harus diisi" }, { status: 400 });
    }

    // Verify user exists
    const [seller] = await db.select().from(users).where(eq(users.id, sellerId));
    if (!seller) {
      return NextResponse.json({ error: "Seller tidak ditemukan" }, { status: 404 });
    }

    // Retrieve seller items stats
    const userItems = await db
      .select({
        id: items.id,
        name: items.name,
        price: items.price,
        isSold: items.isSold,
        isArchived: items.isArchived,
        clicksCount: items.clicksCount,
      })
      .from(items)
      .where(eq(items.sellerId, sellerId));

    const activeListingsCount = userItems.filter((item: any) => !item.isSold && !item.isArchived).length;
    const soldOrArchivedCount = userItems.filter((item: any) => item.isSold || item.isArchived).length;
    const totalClicksCount = userItems.reduce((acc: number, curr: any) => acc + curr.clicksCount, 0);

    // Retrieve detailed click logs for timeline charting using joins
    const clickLogsList = await db
      .select({
        id: clickLogs.id,
        itemId: clickLogs.itemId,
        itemName: items.name,
        platform: clickLogs.platform,
        timestamp: clickLogs.timestamp,
      })
      .from(clickLogs)
      .leftJoin(items, eq(clickLogs.itemId, items.id))
      .where(eq(items.sellerId, sellerId))
      .orderBy(desc(clickLogs.timestamp));

    // Format logs
    const formattedLogs = clickLogsList.map((log: any) => ({
      id: log.id,
      itemId: log.itemId,
      itemName: log.itemName || "Unknown Item",
      platform: log.platform,
      // SQLite stores ISO date strings, node-postgres parses timestamps to Date objects
      timestamp: typeof log.timestamp === "string" ? log.timestamp : (log.timestamp as Date).toISOString(),
    }));

    return NextResponse.json({
      activeListingsCount,
      soldOrArchivedCount,
      totalClicksCount,
      clicksLog: formattedLogs,
    });
  } catch (error) {
    console.error("GET analytics summary Drizzle API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
