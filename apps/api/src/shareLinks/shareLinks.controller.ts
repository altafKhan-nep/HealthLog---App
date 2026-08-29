import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { ShareLink } from "./shareLink.model";
import { Visit } from "../visits/visit.model";
import { AuthedRequest } from "../middleware/requireAuth";

export async function createShareLink(req: AuthedRequest, res: Response) {
  try {
    const { scope, scopeParams, expiresInDays } = req.body;
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

    const link = await ShareLink.create({
      userId: req.userId,
      scope: scope || "all",
      scopeParams: scopeParams || {},
      token,
      expiresAt,
    });

    return res.status(201).json({ ...link.toObject(), shareUrl: `/share/${token}` });
  } catch (err) {
    console.error("[shareLinks] create error:", err);
    return res.status(500).json({ error: "Failed to create share link" });
  }
}

export async function createVisitShareLink(req: AuthedRequest, res: Response) {
  try {
    const { visitId, expiresInHours, expiresInMinutes } = req.body;
    if (!visitId) return res.status(400).json({ error: "visitId is required" });

    const visit = await Visit.findById(visitId);
    if (!visit) return res.status(404).json({ error: "Visit not found" });
    if (visit.userId.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Support both minutes and hours (minutes takes precedence)
    let totalMinutes: number;
    if (expiresInMinutes) {
      totalMinutes = Math.min(Math.max(Number(expiresInMinutes) || 1440, 15), 1440);
    } else {
      const hours = Math.min(Math.max(Number(expiresInHours) || 24, 1), 168);
      totalMinutes = hours * 60;
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + totalMinutes);

    const link = await ShareLink.create({
      userId: req.userId,
      scope: "singleVisit",
      scopeParams: { visitId },
      token,
      oneTimeUse: true,
      used: false,
      expiresAt,
    });

    const publicBase = (process.env.PUBLIC_BASE_URL || "http://192.168.254.5:4000").replace(/\/$/, "");
    const shareUrl = `${publicBase}/share/report/${token}`;

    return res.status(201).json({
      shareUrl,
      token,
      expiresAt,
      expiresInMinutes: totalMinutes,
      linkId: link._id,
    });
  } catch (err) {
    console.error("[shareLinks] create visit link error:", err);
    return res.status(500).json({ error: "Failed to create share link" });
  }
}

export async function listShareLinks(req: AuthedRequest, res: Response) {
  try {
    const links = await ShareLink.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json(links);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch share links" });
  }
}

export async function revokeShareLink(req: AuthedRequest, res: Response) {
  try {
    const link = await ShareLink.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!link) return res.status(404).json({ error: "Share link not found" });
    return res.json({ message: "Share link revoked" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to revoke share link" });
  }
}

export async function getSharedVisits(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const link = await ShareLink.findOne({ token });
    if (!link) return res.status(404).json({ error: "Share link not found or expired" });
    if (link.expiresAt < new Date()) return res.status(410).json({ error: "Share link has expired" });
    if (link.oneTimeUse && link.used) {
      return res.status(410).json({ error: "This link has already been used" });
    }

    if (link.scope === "singleVisit" && link.scopeParams.visitId) {
      const visit = await Visit.findById(link.scopeParams.visitId)
        .populate("hospitalId", "name location");
      if (!visit) return res.status(404).json({ error: "Visit not found" });

      if (link.oneTimeUse) {
        link.used = true;
        await link.save();
      }

      return res.json({ visits: [visit], owner: link.userId });
    }

    const filter: any = { userId: link.userId };
    if (link.scope === "lastNVisits" && link.scopeParams.lastN) {
      const visits = await Visit.find(filter)
        .populate("hospitalId", "name location")
        .sort({ visitDate: -1 })
        .limit(link.scopeParams.lastN);
      if (link.oneTimeUse) { link.used = true; await link.save(); }
      return res.json({ visits, owner: link.userId });
    }
    if (link.scope === "dateRange") {
      filter.visitDate = {};
      if (link.scopeParams.from) filter.visitDate.$gte = link.scopeParams.from;
      if (link.scopeParams.to) filter.visitDate.$lte = link.scopeParams.to;
      if (link.scopeParams.hospitalId) filter.hospitalId = link.scopeParams.hospitalId;
    }

    const visits = await Visit.find(filter).populate("hospitalId", "name location").sort({ visitDate: -1 });
    if (link.oneTimeUse) { link.used = true; await link.save(); }
    return res.json({ visits, owner: link.userId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch shared visits" });
  }
}
