import { Response } from "express";
import { User } from "../auth/auth.model";
import { AuthedRequest } from "../middleware/requireAuth";
import { uploadToCloudinary } from "../config/cloudinary";

/** GET /api/user/profile — get current user's profile */
export async function getProfile(req: AuthedRequest, res: Response) {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error("[user] get profile error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
}

/** PUT /api/user/profile — update profile fields */
export async function updateProfile(req: AuthedRequest, res: Response) {
  try {
    const { name, phone, dateOfBirth, gender, bloodType, emergencyContact } = req.body;
    const update: any = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (dateOfBirth !== undefined) update.dateOfBirth = dateOfBirth || null;
    if (gender !== undefined) update.gender = gender;
    if (bloodType !== undefined) update.bloodType = bloodType;
    if (emergencyContact !== undefined) update.emergencyContact = emergencyContact;

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error("[user] update profile error:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}

/** POST /api/user/profile/picture — upload profile picture (base64) */
export async function uploadProfilePicture(req: AuthedRequest, res: Response) {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 is required" });

    const base64Data = imageBase64.replace(/^data:[\w/]+;base64,/, "");
    const fileBuffer = Buffer.from(base64Data, "base64");
    const { url } = await uploadToCloudinary(fileBuffer, mimeType || "image/jpeg");

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePicture: url },
      { new: true }
    ).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error("[user] upload picture error:", err);
    return res.status(500).json({ error: "Failed to upload picture" });
  }
}
