import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: process.env.ENV_FILE ?? ".env" });

export const db = new Pool({
  ...(process.env.NODE_ENV === "test" && process.env.TEST_DATABASE_URL
    ? { connectionString: process.env.TEST_DATABASE_URL }
    : {}),
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 5433),
  user: process.env.DB_USER ?? "locksmith_secured",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "locksmith_secured",
  max: 10,
});

db.on("error", (error) => console.error(JSON.stringify({ level: "error", event: "database_pool_error", message: error.message, timestamp: new Date().toISOString() })));
