import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  getCircleMembers,
  generateInviteCode,
  joinWithCode,
  getPendingRequests,
  handleApprove,
  handleDecline,
  removeMember,
  getMemberTimeline,
} from "./careCircle.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getCircleMembers);
router.post("/generate-code", generateInviteCode);
router.post("/join", joinWithCode);
router.get("/requests", getPendingRequests);
router.post("/requests/:requestId/approve", handleApprove);
router.post("/requests/:requestId/decline", handleDecline);
router.delete("/:memberId", removeMember);
router.get("/:memberId/timeline", getMemberTimeline);

export default router;
