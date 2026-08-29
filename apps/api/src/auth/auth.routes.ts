import { Router } from "express";
import { signup, login } from "./auth.controller";
import { authLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

export default router;
