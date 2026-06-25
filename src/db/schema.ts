import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. Users Table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  username: text("username").unique(),
  avatar: text("avatar").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 2. Preloved Items Table
export const items = sqliteTable("items", {
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
  imageUrls: text("image_urls").notNull(), // JSON string array (e.g. '["url1", "url2"]')
  isSold: integer("is_sold", { mode: "boolean" }).default(false).notNull(),
  isArchived: integer("is_archived", { mode: "boolean" }).default(false).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  clicksCount: integer("clicks_count").default(0).notNull(),
});

// 3. Click Analytics Logs Table
export const clickLogs = sqliteTable("click_logs", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // "Shopee" | "Tokopedia"
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type ItemSelect = typeof items.$inferSelect;
export type ItemInsert = typeof items.$inferInsert;
export type ClickLogSelect = typeof clickLogs.$inferSelect;
export type ClickLogInsert = typeof clickLogs.$inferInsert;
