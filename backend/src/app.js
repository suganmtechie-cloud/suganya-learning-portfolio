import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import health from "./routes/health.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(express.json({ limit: "1mb" }));
if (env.nodeEnv !== "test") app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ name: "Suganya Learning API", version: "0.1.0" });
});
app.use("/api/health", health);

app.use(notFound);
app.use(errorHandler);

export default app;
