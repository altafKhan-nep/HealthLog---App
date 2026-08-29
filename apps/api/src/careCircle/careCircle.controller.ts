import { Response } from "express";
import { randomBytes } from "crypto";
import { User } from "../auth/auth.model";
import { Visit } from "../visits/visit.model";
import { CareCircleRequest } from "./careCircleRequest.model";
import { AuthedRequest } from "../middleware/requireAuth";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HL-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getCircleMembers(req: AuthedRequest, res: Response) {
  try {
    const user = await User.findById(req.userId).populate("careCircleMembers", "name email profilePicture");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user.careCircleMembers);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch care circle" });
  }
}

export async function generateInviteCode(req: AuthedRequest, res: Response) {
  try {
    const { expiresInDays, role } = req.body;
    const days = Math.min(Math.max(Number(expiresInDays) || 7, 1), 90);
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await CareCircleRequest.deleteMany({ ownerId: req.userId, status: "pending" });

    const request = await CareCircleRequest.create({
      code,
      ownerId: req.userId,
      requesterId: req.userId,
      role: role || "Family Member",
      status: "pending",
      expiresAt,
    });

    const shareUrl = `http://10.100.10.95:4000/share/circle/${code}`;

    return res.status(201).json({
      code,
      shareUrl,
      expiresAt,
      expiresInDays: days,
      requestId: request._id,
    });
  } catch (err) {
    console.error("[careCircle] generate code error:", err);
    return res.status(500).json({ error: "Failed to generate invite code" });
  }
}

export async function joinWithCode(req: AuthedRequest, res: Response) {
  try {
    const { code, role } = req.body;
    if (!code) return res.status(400).json({ error: "Invite code is required" });

    const normalizedCode = code.toUpperCase().trim();
    const invite = await CareCircleRequest.findOne({
      code: normalizedCode,
      status: "pending",
    });

    if (!invite) {
      return res.status(404).json({ error: "Invalid or expired invite code" });
    }
    if (invite.expiresAt < new Date()) {
      return res.status(410).json({ error: "This invite code has expired" });
    }
    if (invite.ownerId.toString() === req.userId) {
      return res.status(400).json({ error: "You cannot join your own care circle" });
    }

    const existing = await CareCircleRequest.findOne({
      ownerId: invite.ownerId,
      requesterId: req.userId,
      status: "pending",
    });
    if (existing) {
      return res.status(409).json({ error: "You already have a pending request with this user" });
    }

    const alreadyMember = await User.findById(invite.ownerId);
    if (alreadyMember?.careCircleMembers.some((id) => id.toString() === req.userId)) {
      return res.status(409).json({ error: "You are already in this care circle" });
    }

    await CareCircleRequest.create({
      code: normalizedCode,
      ownerId: invite.ownerId,
      requesterId: req.userId,
      role: role || "Family Member",
      status: "pending",
      expiresAt: invite.expiresAt,
    });

    const owner = await User.findById(invite.ownerId).select("name");
    return res.json({ message: "Request sent! Waiting for approval.", ownerName: owner?.name });
  } catch (err) {
    console.error("[careCircle] join error:", err);
    return res.status(500).json({ error: "Failed to join care circle" });
  }
}

export async function getPendingRequests(req: AuthedRequest, res: Response) {
  try {
    const requests = await CareCircleRequest.find({
      ownerId: req.userId,
      requesterId: { $ne: req.userId },
      status: "pending",
    })
      .populate("requesterId", "name email profilePicture")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
}

export async function handleApprove(req: AuthedRequest, res: Response) {
  try {
    const { requestId } = req.params;

    const request = await CareCircleRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    if (request.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already handled" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.careCircleMembers.some((id) => id.toString() === request.requesterId.toString())) {
      user.careCircleMembers.push(request.requesterId);
      await user.save();
    }

    request.status = "approved";
    await request.save();

    return res.json({ message: "Request approved" });
  } catch (err) {
    console.error("[careCircle] approve error:", err);
    return res.status(500).json({ error: "Failed to approve request" });
  }
}

export async function handleDecline(req: AuthedRequest, res: Response) {
  try {
    const { requestId } = req.params;

    const request = await CareCircleRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    if (request.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already handled" });
    }

    request.status = "declined";
    await request.save();
    return res.json({ message: "Request declined" });
  } catch (err) {
    console.error("[careCircle] decline error:", err);
    return res.status(500).json({ error: "Failed to decline request" });
  }
}

export async function removeMember(req: AuthedRequest, res: Response) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.careCircleMembers = user.careCircleMembers.filter(
      (id) => id.toString() !== req.params.memberId
    );
    await user.save();

    return res.json({ message: "Member removed" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to remove member" });
  }
}

export async function getMemberTimeline(req: AuthedRequest, res: Response) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.careCircleMembers.some((id) => id.toString() === req.params.memberId)) {
      return res.status(403).json({ error: "Not in your care circle" });
    }

    const visits = await Visit.find({ userId: req.params.memberId })
      .populate("hospitalId", "name location")
      .sort({ visitDate: -1 });

    return res.json(visits);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch member timeline" });
  }
}
