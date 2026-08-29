import { Response } from "express";
import mongoose from "mongoose";
import { Visit } from "../visits/visit.model";
import { AuthedRequest } from "../middleware/requireAuth";

/** Canonicalize a biomarker name so equivalent names merge (e.g. "SGOT / AST" -> "AST"). */
function normalizeTestName(raw: string): string {
  if (!raw) return "";
  const last = raw.toLowerCase().split(/[/,;&|]/).pop() || "";
  return last
    .replace(/[()]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b(hb%|hb)\b/g, "hemoglobin")
    .replace(/\b(sgpt|sgot|alat|asat)\b/g, (m: string) =>
      m === "sgot" || m === "asat" ? "ast" : "alt"
    );
}

/** GET /api/trends — list all test names the user has data for */
export async function listTestNames(req: AuthedRequest, res: Response) {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const result = await Visit.aggregate([
      { $match: { userId, status: "ready" } },
      { $unwind: "$extractedFields.testResults" },
    ]);

    const countMap = new Map<string, number>();
    for (const r of result) {
      const name = normalizeTestName(r.extractedFields?.testResults?.testName);
      if (!name) continue;
      countMap.set(name, (countMap.get(name) || 0) + 1);
    }

    const names = Array.from(countMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return res.json(names);
  } catch (err) {
    console.error("[trends] list error:", err);
    return res.status(500).json({ error: "Failed to fetch test names" });
  }
}

/** GET /api/trends/summary — all test summaries with latest value, status, sparkline */
export async function getTrendsSummary(req: AuthedRequest, res: Response) {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const result = await Visit.aggregate([
      { $match: { userId, status: "ready" } },
      { $unwind: "$extractedFields.testResults" },
      {
        $lookup: {
          from: "hospitals",
          localField: "hospitalId",
          foreignField: "_id",
          as: "hospital",
        },
      },
      { $unwind: { path: "$hospital", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          testName: "$extractedFields.testResults.testName",
          value: "$extractedFields.testResults.value",
          unit: "$extractedFields.testResults.unit",
          referenceRange: "$extractedFields.testResults.referenceRange",
          date: "$visitDate",
          hospitalName: { $ifNull: ["$hospital.name", "Unknown"] },
        },
      },
      { $sort: { date: -1 } },
    ]);

    const testMap = new Map<string, any[]>();
    for (const item of result) {
      if (!item.testName) continue;
      const key = normalizeTestName(item.testName);
      if (!testMap.has(key)) testMap.set(key, []);
      testMap.get(key)!.push(item);
    }

    const summaries = Array.from(testMap.entries()).map(([testName, readings]) => {
      const latest = readings[0];
      const sparklineData = readings.slice(0, 10).reverse().map((r) => r.value);
      
      let statusLabel = "Unknown";
      let statusType: "normal" | "high" | "low" = "normal";
      
      if (latest.referenceRange) {
        const parts = latest.referenceRange.split("-").map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          const [min, max] = parts;
          if (latest.value >= min && latest.value <= max) {
            statusLabel = "Normal";
            statusType = "normal";
          } else if (latest.value < min) {
            statusLabel = "Low";
            statusType = "low";
          } else {
            statusLabel = "High";
            statusType = "high";
          }
        }
      }

      return {
        testName,
        value: latest.value,
        unit: latest.unit || "",
        referenceRange: latest.referenceRange || "",
        statusLabel,
        statusType,
        sparklineData,
        readingCount: readings.length,
      };
    });

    return res.json(summaries);
  } catch (err) {
    console.error("[trends] summary error:", err);
    return res.status(500).json({ error: "Failed to fetch trends summary" });
  }
}

/** GET /api/trends/:testName — time series for a specific test */
export async function getTrendData(req: AuthedRequest, res: Response) {
  try {
    const { testName } = req.params;
    const userId = new mongoose.Types.ObjectId(req.userId);
    const normalizedTarget = normalizeTestName(testName);

    const visits = await Visit.aggregate([
      { $match: { userId, status: "ready" } },
      {
        $lookup: {
          from: "hospitals",
          localField: "hospitalId",
          foreignField: "_id",
          as: "hospital",
        },
      },
      { $unwind: { path: "$hospital", preserveNullAndEmptyArrays: true } },
    ]);

    const result: any[] = [];
    for (const v of visits) {
      for (const tr of v.extractedFields?.testResults || []) {
        if (normalizeTestName(tr.testName) === normalizedTarget) {
          result.push({
            date: v.visitDate,
            value: tr.value,
            unit: tr.unit,
            referenceRange: tr.referenceRange,
            hospitalName: v.hospital?.name || "Unknown",
            hospitalId: v.hospital?._id,
          });
        }
      }
    }
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return res.json(result);
  } catch (err) {
    console.error("[trends] data error:", err);
    return res.status(500).json({ error: "Failed to fetch trend data" });
  }
}
