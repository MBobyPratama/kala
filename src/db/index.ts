import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import path from "path";
import * as schema from "./schema";

const getDbInstance = () => {
  const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

  if (dbUrl.startsWith("file:") || dbUrl.includes(".db") || dbUrl.startsWith("sqlite:")) {
    // Resolve absolute path to SQLite file
    const relativePath = dbUrl.replace("file:", "").replace("sqlite:", "");
    const absolutePath = path.resolve(process.cwd(), relativePath);
    
    const client = new Database(absolutePath);
    return drizzleSqlite(client, { schema });
  } else {
    // PostgreSQL Direct Connection
    const pool = new Pool({ connectionString: dbUrl });
    return drizzlePg(pool, { schema });
  }
};

export const db = getDbInstance() as any;
export default db;
export * from "./schema";
