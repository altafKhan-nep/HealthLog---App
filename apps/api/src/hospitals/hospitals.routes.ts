import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  listHospitals,
  listVisitedHospitals,
  createHospital,
  getHospital,
  getHospitalDoctors,
  getHospitalVisits,
} from "./hospitals.controller";

const router = Router();

router.use(requireAuth);

router.get("/visited", listVisitedHospitals);
router.get("/", listHospitals);
router.post("/", createHospital);
router.get("/:id", getHospital);
router.get("/:id/doctors", getHospitalDoctors);
router.get("/:id/visits", getHospitalVisits);

export default router;
