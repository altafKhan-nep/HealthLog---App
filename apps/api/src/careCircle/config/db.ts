import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set — check your .env file");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    });
    console.log("[db] connected to MongoDB");
  } catch (err) {
    console.error("[db] failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("[db] MongoDB disconnected — attempting reconnect...");
});

mongoose.connection.on("error", (err) => {
  console.error("[db] MongoDB error:", err);
});
