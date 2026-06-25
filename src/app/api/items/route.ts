import { NextResponse } from "next/server";
import { db, items, users } from "@/db";
import { and, eq, gte, lte, or, inArray, isNotNull, desc, like } from "drizzle-orm";
import crypto from "crypto";

// GET: Retrieve preloved items with advanced search & filters (Drizzle ORM)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const condition = searchParams.get("condition") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const shopeeOnly = searchParams.get("shopeeOnly") === "true";
    const tokopediaOnly = searchParams.get("tokopediaOnly") === "true";
    const sellerUsername = searchParams.get("sellerUsername") || "";
    const includeArchived = searchParams.get("includeArchived") === "true";

    const filters: any[] = [];

    // Filter out archived items unless explicitly requested (e.g. dashboard)
    if (!includeArchived) {
      filters.push(eq(items.isArchived, false));
    }

    // Handle sellerUsername filter
    if (sellerUsername) {
      filters.push(eq(users.username, sellerUsername.toLowerCase()));
    } else {
      // General catalog hides sold and archived items
      filters.push(eq(items.isSold, false));
      filters.push(eq(items.isArchived, false));
    }

    // Category filter
    if (category) {
      const cats = category.split(",");
      filters.push(inArray(items.category, cats));
    }

    // Condition filter
    if (condition) {
      const conds = condition.split(",");
      filters.push(inArray(items.condition, conds));
    }

    // Price range filters
    if (minPrice) {
      filters.push(gte(items.price, parseInt(minPrice)));
    }
    if (maxPrice) {
      filters.push(lte(items.price, parseInt(maxPrice)));
    }

    // Marketplace availability checks
    if (shopeeOnly) {
      filters.push(isNotNull(items.shopeeUrl));
    }
    if (tokopediaOnly) {
      filters.push(isNotNull(items.tokopediaUrl));
    }

    // Search query matching product fields or seller fields
    if (search) {
      const q = `%${search.toLowerCase()}%`;
      filters.push(
        or(
          like(items.name, q),
          like(items.description, q),
          like(items.category, q),
          like(users.name, q),
          like(users.username, q)
        )
      );
    }

    // Query Drizzle database using joins
    const rawItems = await db
      .select({
        id: items.id,
        name: items.name,
        category: items.category,
        condition: items.condition,
        price: items.price,
        description: items.description,
        sellerId: items.sellerId,
        shopeeUrl: items.shopeeUrl,
        tokopediaUrl: items.tokopediaUrl,
        imageUrls: items.imageUrls,
        isSold: items.isSold,
        isArchived: items.isArchived,
        createdAt: items.createdAt,
        clicksCount: items.clicksCount,
        seller: {
          username: users.username,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(items)
      .leftJoin(users, eq(items.sellerId, users.id))
      .where(and(...filters))
      .orderBy(desc(items.createdAt));

    // Map and deserialize JSON string arrays back to standard string[] arrays
    const formattedItems = rawItems.map((row: any) => {
      let parsedImages: string[] = [];
      try {
        parsedImages = JSON.parse(row.imageUrls);
      } catch (e) {
        parsedImages = [row.imageUrls];
      }

      return {
        id: row.id,
        name: row.name,
        category: row.category,
        condition: row.condition,
        price: row.price,
        description: row.description,
        sellerId: row.sellerId,
        shopeeUrl: row.shopeeUrl,
        tokopediaUrl: row.tokopediaUrl,
        isSold: row.isSold,
        isArchived: row.isArchived,
        createdAt: row.createdAt,
        clicksCount: row.clicksCount,
        sellerUsername: row.seller?.username || "unknown",
        sellerName: row.seller?.name || "Unknown Seller",
        imageUrls: parsedImages,
      };
    });

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error("GET items Drizzle API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new preloved item listing (Fixed Price system validation)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      condition,
      price,
      description,
      sellerId,
      shopeeUrl,
      tokopediaUrl,
      imageUrls,
    } = body;

    // Parameter checks
    if (!name || name.trim().length < 5 || name.trim().length > 80) {
      return NextResponse.json({ error: "Nama barang harus 5 - 80 karakter" }, { status: 400 });
    }

    if (!price || price <= 0) {
      return NextResponse.json({ error: "Harga barang harus di atas Rp 0" }, { status: 400 });
    }

    if (!description || description.trim().length === 0 || description.trim().length > 1000) {
      return NextResponse.json({ error: "Deskripsi barang harus diisi (maks 1000 karakter)" }, { status: 400 });
    }

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID tidak valid" }, { status: 400 });
    }

    // Regexp matches
    const shopeeRegex = /shopee\.co\.id\/.+/i;
    const tokopediaRegex = /tokopedia\.com\/.+/i;

    const shopeeValid = shopeeUrl ? shopeeRegex.test(shopeeUrl.trim()) : false;
    const tokopediaValid = tokopediaUrl ? tokopediaRegex.test(tokopediaUrl.trim()) : false;

    if (shopeeUrl && !shopeeValid) {
      return NextResponse.json({ error: "Format link Shopee tidak valid" }, { status: 400 });
    }

    if (tokopediaUrl && !tokopediaValid) {
      return NextResponse.json({ error: "Format link Tokopedia tidak valid" }, { status: 400 });
    }

    if (!shopeeUrl && !tokopediaUrl) {
      return NextResponse.json({ error: "Wajib menyertakan minimal 1 link checkout (Shopee / Tokopedia)" }, { status: 400 });
    }

    const urlsToStore = Array.isArray(imageUrls) ? imageUrls : ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80"];

    const itemId = "item-" + crypto.randomUUID().substring(0, 8);

    const [rawItem] = await db
      .insert(items)
      .values({
        id: itemId,
        name,
        category,
        condition,
        price: parseInt(price),
        description,
        sellerId,
        shopeeUrl: shopeeUrl ? shopeeUrl.trim() : null,
        tokopediaUrl: tokopediaUrl ? tokopediaUrl.trim() : null,
        imageUrls: JSON.stringify(urlsToStore),
        clicksCount: 0,
      })
      .returning();

    // Fetch seller profile to return complete response structure
    const [seller] = await db
      .select({ username: users.username, name: users.name })
      .from(users)
      .where(eq(users.id, sellerId));

    const createdItem = {
      ...rawItem,
      sellerUsername: seller?.username || "",
      sellerName: seller?.name || "",
      imageUrls: urlsToStore,
    };

    return NextResponse.json(createdItem);
  } catch (error) {
    console.error("POST item Drizzle API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
