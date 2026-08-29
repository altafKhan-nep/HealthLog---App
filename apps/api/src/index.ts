import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";

import authRoutes from "./auth/auth.routes";
import hospitalsRoutes from "./hospitals/hospitals.routes";
import visitsRoutes from "./visits/visits.routes";
import trendsRoutes from "./trends/trends.routes";
import shareLinksRoutes from "./shareLinks/shareLinks.routes";
import careCircleRoutes from "./careCircle/careCircle.routes";
import userRoutes from "./user/user.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalsRoutes);
app.use("/api/visits", visitsRoutes);
app.use("/api/trends", trendsRoutes);
app.use("/api/share-links", shareLinksRoutes);
app.use("/api/care-circle", careCircleRoutes);
app.use("/api/user", userRoutes);

async function start() {
  await connectDB();
  const port = Number(PORT);
  app.listen(port, "0.0.0.0", () => {
    console.log(`[api] HealthLog API running on http://0.0.0.0:${port}`);
  });
}

start();
