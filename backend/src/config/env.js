import dotenv from "dotenv";

dotenv.config({ path: new URL("../../../.env.local", import.meta.url).pathname });
dotenv.config({ path: new URL("../../../.env", import.meta.url).pathname });
dotenv.config(); // Optional backend/.env fallback for standalone local development.

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};
