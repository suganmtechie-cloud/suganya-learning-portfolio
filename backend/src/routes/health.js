import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: "degraded", database: "unavailable" });
  }
});

export default router;
