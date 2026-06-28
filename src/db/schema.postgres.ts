import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

// 1. Users Table (PostgreSQL)
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  username: text("username").unique(),
  avatar: text("avatar").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Preloved Items Table (PostgreSQL)
export const items = pgTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  sellerId: text("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  shopeeUrl: text("shopee_url"),
  tokopediaUrl: text("tokopedia_url"),
  imageUrls: text("image_urls").array().notNull(), // PostgreSQL native arrays
  isSold: boolean("is_sold").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  clicksCount: integer("clicks_count").default(0).notNull(),
});

// 3. Click Analytics Logs Table (PostgreSQL)
export const clickLogs = pgTable("click_logs", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // "Shopee" | "Tokopedia"
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
