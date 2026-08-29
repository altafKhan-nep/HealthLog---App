import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { listTestNames, getTrendsSummary, getTrendData } from "./trends.controller";

const router = Router();

router.use(requireAuth);

router.get("/summary", getTrendsSummary);
router.get("/", listTestNames);
router.get("/:testName", getTrendData);

export default router;
