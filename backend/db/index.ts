import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const getDbClient = () => {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("TURSO_DATABASE_URL is not set");
    throw new Error("Database URL not configured");
  }

  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
};

let dbInstance: ReturnType<typeof getDbClient> | null = null;

export const getDb = () => {
  if (!dbInstance) {
    dbInstance = getDbClient();
  }
  return dbInstance;
};

export const db = {
  get instance() {
    return getDb();
  }
};

export * from "./schema";
