import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/requireAuth";
import {
  createVisit,
  uploadAttachment,
  uploadBatchAttachments,
  listVisits,
  getVisit,
  updateVisit,
  deleteVisit,
} from "./visits.controller";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.use(requireAuth);

router.get("/", listVisits);
router.post("/", createVisit);
router.get("/:id", getVisit);
router.put("/:id", updateVisit);
router.delete("/:id", deleteVisit);
router.post("/:id/attachments", upload.single("file"), uploadAttachment);
router.post("/:id/attachments/batch", uploadBatchAttachments);

export default router;
