import { NextResponse } from "next/server";
import { db, items, users } from "@/db";
import { eq } from "drizzle-orm";

interface ParamsProps {
  params: Promise<{
    id: string;
  }>;
}

// GET: Retrieve a single preloved item (Drizzle ORM)
export async function GET(request: Request, { params }: ParamsProps) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const [row] = await db
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
      .where(eq(items.id, id));

    if (!row) {
      return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });
    }

    let parsedImages: string[] = [];
    try {
      parsedImages = JSON.parse(row.imageUrls);
    } catch (e) {
      parsedImages = [row.imageUrls];
    }

    const item = {
      ...row,
      sellerUsername: row.seller?.username || "unknown",
      sellerName: row.seller?.name || "Unknown Seller",
      imageUrls: parsedImages,
    };

    return NextResponse.json(item);
  } catch (error) {
    console.error("GET item by ID error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Edit listing details or change status (Sold Out/Archived)
export async function PATCH(request: Request, { params }: ParamsProps) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const {
      name,
      category,
      condition,
      price,
      description,
      shopeeUrl,
      tokopediaUrl,
      imageUrls,
      isSold,
      isArchived,
    } = body;

    // Check existence
    const [existing] = await db.select().from(items).where(eq(items.id, id));
    if (!existing) {
      return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });
    }

    // Build update parameters
    const updateData: any = {};
    
    if (name !== undefined) {
      if (name.trim().length < 5 || name.trim().length > 80) {
        return NextResponse.json({ error: "Nama barang harus 5 - 80 karakter" }, { status: 400 });
      }
      updateData.name = name;
    }

    if (category !== undefined) updateData.category = category;
    if (condition !== undefined) updateData.condition = condition;
    
    if (price !== undefined) {
      if (price <= 0) {
        return NextResponse.json({ error: "Harga barang harus di atas Rp 0" }, { status: 400 });
      }
      updateData.price = parseInt(price);
    }

    if (description !== undefined) {
      if (description.trim().length === 0 || description.trim().length > 1000) {
        return NextResponse.json({ error: "Deskripsi barang harus diisi (maks 1000 karakter)" }, { status: 400 });
      }
      updateData.description = description;
    }

    if (shopeeUrl !== undefined) updateData.shopeeUrl = shopeeUrl ? shopeeUrl.trim() : null;
    if (tokopediaUrl !== undefined) updateData.tokopediaUrl = tokopediaUrl ? tokopediaUrl.trim() : null;
    if (imageUrls !== undefined) updateData.imageUrls = JSON.stringify(imageUrls);
    if (isSold !== undefined) updateData.isSold = isSold;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const [rawItem] = await db
      .update(items)
      .set(updateData)
      .where(eq(items.id, id))
      .returning();

    // Fetch seller profile to return complete response
    const [seller] = await db
      .select({ username: users.username, name: users.name })
      .from(users)
      .where(eq(users.id, rawItem.sellerId));

    let parsedImages: string[] = [];
    try {
      parsedImages = JSON.parse(rawItem.imageUrls);
    } catch (e) {
      parsedImages = [rawItem.imageUrls];
    }

    const updatedItem = {
      ...rawItem,
      sellerUsername: seller?.username || "",
      sellerName: seller?.name || "",
      imageUrls: parsedImages,
    };

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("PATCH item Drizzle API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Terminate listing completely
export async function DELETE(request: Request, { params }: ParamsProps) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const [existing] = await db.select().from(items).where(eq(items.id, id));
    if (!existing) {
      return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });
    }

    await db.delete(items).where(eq(items.id, id));

    return NextResponse.json({ success: true, message: "Barang berhasil dihapus" });
  } catch (error) {
    console.error("DELETE item Drizzle API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
