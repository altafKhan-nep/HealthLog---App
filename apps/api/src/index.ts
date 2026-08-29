import "dotenv/config";
import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./careCircle/config/db";
import { apiLimiter } from "./middleware/rateLimit";

import authRoutes from "./auth/auth.routes";
import hospitalsRoutes from "./hospitals/hospitals.routes";
import visitsRoutes from "./visits/visits.routes";
import trendsRoutes from "./trends/trends.routes";
import shareLinksRoutes from "./shareLinks/shareLinks.routes";
import careCircleRoutes from "./careCircle/careCircle.routes";
import userRoutes from "./user/user.routes";
import sharePagesRoutes from "./sharePages";

const app = express();
const PORT = process.env.PORT || 4000;

// Security headers. The share pages render inline scripts for the "open in app"
// flow, so CSP allows inline styles/scripts there; all other protections remain.
// Dynamic data injected into the share pages is HTML-escaped (see sharePages.ts).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        frameSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  })
);

// Trust one hop of reverse proxy so rate limiting sees the real client IP
app.set("trust proxy", 1);

// CORS — this app's clients are the native mobile app (no Origin header) and
// optional trusted web origins from config. We do NOT allow all origins.
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:4000,http://192.168.254.5:4000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: false,
  })
);

app.use(express.json({ limit: "50mb" }));

// Serve the app logo (original brand mark) so browser share pages show the real logo.
app.use("/assets", express.static(path.join(__dirname, "../../mobile/assets"), { maxAge: "1d", index: false }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// General API throttle
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalsRoutes);
app.use("/api/visits", visitsRoutes);
app.use("/api/trends", trendsRoutes);
app.use("/api/share-links", shareLinksRoutes);
app.use("/api/care-circle", careCircleRoutes);
app.use("/api/user", userRoutes);

// Browser fallback pages for shared links (deep-link target + read-only view)
app.use(sharePagesRoutes);

async function start() {
  await connectDB();
  const port = Number(PORT);
  app.listen(port, "0.0.0.0", () => {
    console.log(`[api] HealthLog API running on http://0.0.0.0:${port}`);
  });
}

start();
