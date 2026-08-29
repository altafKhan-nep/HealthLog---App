import { Request, Response } from "express";
import { Hospital } from "./hospital.model";
import { Visit } from "../visits/visit.model";
import { AuthedRequest } from "../middleware/requireAuth";

/** GET /api/hospitals — list global hospitals + user's hospitals */
export async function listHospitals(req: AuthedRequest, res: Response) {
  try {
    const hospitals = await Hospital.find({
      $or: [{ isGlobal: true }, { userId: req.userId }],
    }).sort({ isGlobal: -1, lastVisitDate: -1 });
    return res.json(hospitals);
  } catch (err) {
    console.error("[hospitals] list error:", err);
    return res.status(500).json({ error: "Failed to fetch hospitals" });
  }
}

/** GET /api/hospitals/visited — only hospitals the user has actually visited */
export async function listVisitedHospitals(req: AuthedRequest, res: Response) {
  try {
    const visitedHospitalIds = await Visit.distinct("hospitalId", { userId: req.userId });
    const hospitals = await Hospital.find({ _id: { $in: visitedHospitalIds } }).sort({ lastVisitDate: -1 });
    return res.json(hospitals);
  } catch (err) {
    console.error("[hospitals] visited list error:", err);
    return res.status(500).json({ error: "Failed to fetch visited hospitals" });
  }
}

/** POST /api/hospitals — create a new hospital (user-specific) */
export async function createHospital(req: AuthedRequest, res: Response) {
  try {
    const { name, type, location } = req.body;
    if (!name) return res.status(400).json({ error: "Hospital name is required" });

    const existing = await Hospital.findOne({ userId: req.userId, name: name.trim() });
    if (existing) return res.status(409).json({ error: "Hospital already exists", hospital: existing });

    const hospital = await Hospital.create({
      userId: req.userId,
      name: name.trim(),
      type: type || "hospital",
      location: location || "",
      isGlobal: false,
    });
    return res.status(201).json(hospital);
  } catch (err: any) {
    if (err.code === 11000) {
      const hospital = await Hospital.findOne({ userId: req.userId, name: req.body.name.trim() });
      return res.status(409).json({ error: "Hospital already exists", hospital });
    }
    console.error("[hospitals] create error:", err);
    return res.status(500).json({ error: "Failed to create hospital" });
  }
}

/** PUT /api/hospitals/:id — update a user-owned (non-global) hospital */
export async function updateHospital(req: AuthedRequest, res: Response) {
  try {
    const hospital = await Hospital.findOne({ _id: req.params.id, userId: req.userId, isGlobal: false });
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    const { name, type, location } = req.body;

    if (name && name.trim() !== hospital.name) {
      const dup = await Hospital.findOne({ userId: req.userId, name: name.trim(), _id: { $ne: hospital._id } });
      if (dup) return res.status(409).json({ error: "You already have a hospital with that name" });
    }

    if (name) hospital.name = name.trim();
    if (location !== undefined) hospital.location = location;
    if (type) hospital.type = type;

    await hospital.save();
    return res.json(hospital);
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: "You already have a hospital with that name" });
    console.error("[hospitals] update error:", err);
    return res.status(500).json({ error: "Failed to update hospital" });
  }
}

/** DELETE /api/hospitals/:id — delete a user-owned hospital (blocked if it has visits) */
export async function deleteHospital(req: AuthedRequest, res: Response) {
  try {
    const hospital = await Hospital.findOne({ _id: req.params.id, userId: req.userId, isGlobal: false });
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    const visitCount = await Visit.countDocuments({ userId: req.userId, hospitalId: hospital._id });
    if (visitCount > 0) {
      return res.status(409).json({
        error: `This hospital has ${visitCount} visit${visitCount > 1 ? "s" : ""} attached. Delete or move those visits first.`,
      });
    }

    await Hospital.findByIdAndDelete(hospital._id);
    return res.json({ message: "Hospital deleted" });
  } catch (err) {
    console.error("[hospitals] delete error:", err);
    return res.status(500).json({ error: "Failed to delete hospital" });
  }
}

/** GET /api/hospitals/:id — get hospital detail */
export async function getHospital(req: AuthedRequest, res: Response) {
  try {
    const hospital = await Hospital.findOne({
      _id: req.params.id,
      $or: [{ isGlobal: true }, { userId: req.userId }],
    });
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });
    return res.json(hospital);
  } catch (err) {
    console.error("[hospitals] get error:", err);
    return res.status(500).json({ error: "Failed to fetch hospital" });
  }
}

/** GET /api/hospitals/:id/doctors — distinct doctors at this hospital */
export async function getHospitalDoctors(req: AuthedRequest, res: Response) {
  try {
    const visits = await Visit.find({
      userId: req.userId,
      hospitalId: req.params.id,
      doctorName: { $ne: "" },
    }).sort({ visitDate: -1 });

    const doctors = [...new Set(visits.map((v) => v.doctorName))];
    return res.json(doctors);
  } catch (err) {
    console.error("[hospitals] doctors error:", err);
    return res.status(500).json({ error: "Failed to fetch doctors" });
  }
}

/** GET /api/hospitals/:id/visits — visits for a specific hospital */
export async function getHospitalVisits(req: AuthedRequest, res: Response) {
  try {
    const hospital = await Hospital.findOne({
      _id: req.params.id,
      $or: [{ isGlobal: true }, { userId: req.userId }],
    });
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    const visits = await Visit.find({
      userId: req.userId,
      hospitalId: req.params.id,
    })
      .populate("hospitalId", "name location")
      .sort({ visitDate: -1 });

    return res.json({ hospital, visits });
  } catch (err) {
    console.error("[hospitals] visits error:", err);
    return res.status(500).json({ error: "Failed to fetch hospital visits" });
  }
}
