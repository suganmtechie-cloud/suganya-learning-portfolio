import pg from "pg";
import { env } from "./env.js";

export const pool = new pg.Pool({
  connectionString: env.databaseUrl || undefined,
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
});

export const query = (text, params) => pool.query(text, params);
