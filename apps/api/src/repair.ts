import "dotenv/config";
import mongoose from "mongoose";
import { Visit } from "./visits/visit.model";

/**
 * One-time repair: flip stuck "processing" visits that already have AI results
 * to "ready" so they show up in Trends. Run: npx ts-node src/repair.ts
 */
async function repair() {
  const MONGODB_URI = process.env.MONGODB_URI as string;
  await mongoose.connect(MONGODB_URI);
  console.log("[repair] Connected to MongoDB");

  const res = await Visit.updateMany(
    {
      status: "processing",
      entryMethod: "scan",
      "extractedFields.testResults.0": { $exists: true },
    },
    { $set: { status: "ready" } }
  );
  console.log(`[repair] Flipped ${res.modifiedCount} stuck processing visits to ready`);

  await mongoose.disconnect();
  console.log("[repair] Done!");
}

repair().catch((err) => {
  console.error("[repair] Error:", err);
  process.exit(1);
});
