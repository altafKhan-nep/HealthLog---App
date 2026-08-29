import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  createShareLink,
  createVisitShareLink,
  listShareLinks,
  revokeShareLink,
  getSharedVisits,
} from "./shareLinks.controller";

const router = Router();

router.get("/public/:token", getSharedVisits);

router.use(requireAuth);
router.get("/", listShareLinks);
router.post("/", createShareLink);
router.post("/visit", createVisitShareLink);
router.delete("/:id", revokeShareLink);

export default router;
