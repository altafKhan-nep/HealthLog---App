import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { getProfile, updateProfile, uploadProfilePicture } from "./user.controller";

const router = Router();

router.use(requireAuth);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/picture", uploadProfilePicture);

export default router;
