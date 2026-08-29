import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  listHospitals,
  listVisitedHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospital,
  getHospitalDoctors,
  getHospitalVisits,
} from "./hospitals.controller";

const router = Router();

router.use(requireAuth);

router.get("/visited", listVisitedHospitals);
router.get("/", listHospitals);
router.post("/", createHospital);
router.put("/:id", updateHospital);
router.delete("/:id", deleteHospital);
router.get("/:id", getHospital);
router.get("/:id/doctors", getHospitalDoctors);
router.get("/:id/visits", getHospitalVisits);

export default router;
