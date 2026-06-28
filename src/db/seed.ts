import { db, users, items, clickLogs } from "./index";

async function main() {
  console.log("🌱 Starting Drizzle seeding...");

  try {
    // Delete existing records
    await db.delete(clickLogs);
    await db.delete(items);
    await db.delete(users);

    console.log("🧹 Database cleared.");

    // 1. Seed Users
    const u1 = {
      id: "user-1",
      email: "siti@fashion.com",
      name: "Siti Rahma",
      username: "siti",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    };

    const u2 = {
      id: "user-2",
      email: "budi@thrift.com",
      name: "Budi Santoso",
      username: "budi",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    };

    await db.insert(users).values([u1, u2]);
    console.log("👥 Users seeded.");

    // 2. Seed Items (with imageUrls stored as stringified JSON array)
    const it1 = {
      id: "item-1",
      name: "Sony WH-1000XM4 Noise Canceling Headphones",
      category: "Electronics & Gadgets",
      condition: "9/10 Excellent",
      price: 2500000,
      description: "Sony headphones in black color. Used for about 6 months, mostly inside the office. Battery health is great, lasts up to 30 hours. Complete with original box, aux cable, and carrying case. Selling because I upgraded to XM5.",
      sellerId: "user-1",
      shopeeUrl: "https://shopee.co.id/Sony-WH-1000XM4-Noise-Canceling-Headphones",
      tokopediaUrl: "https://tokopedia.com/sony-wh1000xm4-original",
      imageUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
      ]),
      clicksCount: 12,
    };

    const it2 = {
      id: "item-2",
      name: "Nike Air Max 97 Triple White - US 9",
      category: "Fashion & Accessories",
      condition: "8/10 Good Condition",
      price: 1250000,
      description: "Original Nike Air Max 97 in Triple White. Size US 9 / EU 42.5. Slight yellowing on the midsole which is normal for AM97, but overall in great shape. Insoles are clean, air bubble is fully intact and responsive. No box.",
      sellerId: "user-1",
      shopeeUrl: "https://shopee.co.id/Nike-Air-Max-97-Triple-White-Preloved",
      tokopediaUrl: null,
      imageUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop&q=80"
      ]),
      clicksCount: 8,
    };

    const it3 = {
      id: "item-3",
      name: "Keychron K2 V2 Wireless Mechanical Keyboard (Brown Switches)",
      category: "Electronics & Gadgets",
      condition: "10/10 Like New",
      price: 950000,
      description: "Keychron K2 wireless keyboard, hot-swappable version with Gateron Brown switches and RGB backlight. Box opened only to test the typing feel. Complete with extra keycaps for Mac/Windows layouts, keycap puller, and USB-C cable. Absolutely no flaws.",
      sellerId: "user-2",
      shopeeUrl: null,
      tokopediaUrl: "https://tokopedia.com/keychron-k2-v2-brown-switches",
      imageUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80"
      ]),
      clicksCount: 5,
    };

    const it4 = {
      id: "item-4",
      name: "The Lean Startup by Eric Ries (Hardcover)",
      category: "Books & Literature",
      condition: "9/10 Excellent",
      price: 150000,
      description: "Original English edition hardcover version of The Lean Startup. No highlighting, writing, or dog-eared pages inside. Spine is in perfect condition, pages are slightly off-white due to safe bookshelf storage.",
      sellerId: "user-2",
      shopeeUrl: "https://shopee.co.id/The-Lean-Startup-Eric-Ries-Hardcover",
      tokopediaUrl: "https://tokopedia.com/the-lean-startup-hardcover",
      imageUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
      ]),
      clicksCount: 2,
    };

    const it5 = {
      id: "item-5",
      name: "Fujifilm Instax Mini 11 - Charcoal Gray",
      category: "Hobbies & Collectibles",
      condition: "9/10 Excellent",
      price: 800000,
      description: "Fujifilm Instax Mini 11 in Charcoal Gray. Includes protective clear acrylic case, neck strap, and user guide. Works flawlessly, flash and focus are spot on. Requires 2 AA batteries.",
      sellerId: "user-1",
      shopeeUrl: "https://shopee.co.id/Instax-Mini-11-Charcoal-Gray",
      tokopediaUrl: "https://tokopedia.com/fujifilm-instax-mini-11",
      imageUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"
      ]),
      clicksCount: 3,
    };

    await db.insert(items).values([it1, it2, it3, it4, it5]);
    console.log("📦 Items seeded.");

    // 3. Seed Click Logs
    const itemsList = [it1, it2, it3, it4, it5];
    let logCount = 0;
    for (const item of itemsList) {
      const clicks = item.clicksCount;
      const valuesToInsert: any[] = [];
      
      for (let i = 0; i < clicks; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 8 * 60 * 60 * 1000);
        
        valuesToInsert.push({
          id: `click-${item.id}-${i}`,
          itemId: item.id,
          platform: Math.random() > 0.5 ? "Shopee" : "Tokopedia",
          // sqlite stores timestamp as text or ISO string
          timestamp: timestamp.toISOString(),
        });
        logCount++;
      }
      
      if (valuesToInsert.length > 0) {
        await db.insert(clickLogs).values(valuesToInsert);
      }
    }

    console.log(`📊 ${logCount} Click logs seeded.`);
    console.log("🌱 Drizzle seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();
