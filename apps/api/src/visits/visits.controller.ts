import { Request, Response } from "express";
// @ts-ignore
import pdfParse from "pdf-parse";
import { Hospital } from "../hospitals/hospital.model";
import { Visit } from "./visit.model";
import { User } from "../auth/auth.model";
import { AuthedRequest } from "../middleware/requireAuth";
import { uploadToCloudinary, deleteFromCloudinary } from "../careCircle/config/cloudinary";
import { extractTextFromImage, extractReportFields, generatePlainLanguageSummary } from "../careCircle/config/groq";

const MAX_BATCH_FILES = 20;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

function validateUpload(mimeType: string, byteLength: number): string | null {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return `Unsupported file type: ${mimeType}`;
  }
  if (byteLength > MAX_FILE_BYTES) {
    return `File exceeds the ${Math.round(MAX_FILE_BYTES / (1024 * 1024))}MB limit`;
  }
  return null;
}

/** POST /api/visits — create a new visit */
export async function createVisit(req: AuthedRequest, res: Response) {
  try {
    const { hospitalId, visitDate, doctorName, reason, tag } = req.body;
    if (!hospitalId || !visitDate) {
      return res.status(400).json({ error: "hospitalId and visitDate are required" });
    }

    const hospital = await Hospital.findOne({
      _id: hospitalId,
      $or: [{ isGlobal: true }, { userId: req.userId }],
    });
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    const visit = await Visit.create({
      userId: req.userId,
      hospitalId,
      visitDate,
      doctorName: doctorName || "",
      reason: reason || "",
      tag: tag || "other",
      status: "ready",
      entryMethod: "manual",
    });

    // Update hospital visit count and dates
    await Hospital.findByIdAndUpdate(hospitalId, {
      $inc: { visitCount: 1 },
      $set: { lastVisitDate: visitDate },
      $min: { firstVisitDate: visitDate },
    });

    const populated = await visit.populate("hospitalId", "name location type");
    return res.status(201).json(populated);
  } catch (err) {
    console.error("[visits] create error:", err);
    return res.status(500).json({ error: "Failed to create visit" });
  }
}

/** POST /api/visits/:id/attachments — upload a photo/PDF (base64 or multipart) */
export async function uploadAttachment(req: AuthedRequest, res: Response) {
  try {
    const visit = await Visit.findOne({ _id: req.params.id, userId: req.userId });
    if (!visit) return res.status(404).json({ error: "Visit not found" });

    let fileBuffer: Buffer;
    let mimeType: string;

    // Support both base64 (from mobile) and multipart (from web/testing)
    if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:[\w/]+;base64,/, "");
      fileBuffer = Buffer.from(base64Data, "base64");
      mimeType = req.body.mimeType || "image/jpeg";
    } else if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else {
      return res.status(400).json({ error: "No file provided" });
    }

    const validateErr = validateUpload(mimeType || "application/octet-stream", fileBuffer.length);
    if (validateErr) return res.status(400).json({ error: validateErr });

    const { url, publicId } = await uploadToCloudinary(fileBuffer, mimeType);

    const name = (req.body.name as string) || (req.file?.originalname as string) || "";
    const size = Number(req.body.size) || fileBuffer.length;

    visit.attachments.push({
      fileUrl: url,
      fileType: mimeType,
      cloudinaryPublicId: publicId,
      name,
      size,
    });

    // Persist the newly added attachment (must save the full doc, not just a field update).
    await visit.save();

    // Mark processing only if not already ready (avoid clobbering a completed report)
    await Visit.updateOne(
      { _id: visit._id, status: { $ne: "ready" } },
      { $set: { status: "processing", entryMethod: "scan" } }
    );
    visit.status = "processing";
    visit.entryMethod = "scan";

    // Process in background (non-blocking)
    processReport(visit._id.toString(), url, mimeType, fileBuffer).catch((err) =>
      console.error("[pipeline] processing error:", err)
    );

    return res.json(visit);
  } catch (err) {
    console.error("[visits] attachment error:", err);
    return res.status(500).json({ error: "Failed to upload attachment" });
  }
}

/** POST /api/visits/:id/attachments/batch — upload multiple files (base64 array) */
export async function uploadBatchAttachments(req: AuthedRequest, res: Response) {
  try {
    const visit = await Visit.findOne({ _id: req.params.id, userId: req.userId });
    if (!visit) return res.status(404).json({ error: "Visit not found" });

    const { files } = req.body;
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "files array is required" });
    }
    if (files.length > MAX_BATCH_FILES) {
      return res.status(400).json({ error: `You can upload a maximum of ${MAX_BATCH_FILES} files at once` });
    }

    const uploaded: Array<{ fileUrl: string; fileType: string; cloudinaryPublicId: string; name: string; size: number }> = [];
    const toProcess: Array<{ url: string; mimeType: string; fileBuffer: Buffer }> = [];

    for (const file of files) {
      try {
        const base64Data = (file.imageBase64 || "").replace(/^data:[\w/]+;base64,/, "");
        const fileBuffer = Buffer.from(base64Data, "base64");
        const mimeType = file.mimeType || "application/octet-stream";

        const validateErr = validateUpload(mimeType, fileBuffer.length);
        if (validateErr) {
          console.error("[batch] rejected file:", validateErr);
          continue;
        }

        const { url, publicId } = await uploadToCloudinary(fileBuffer, mimeType);
        uploaded.push({
          fileUrl: url,
          fileType: mimeType,
          cloudinaryPublicId: publicId,
          name: file.name || "",
          size: Number(file.size) || fileBuffer.length,
        });
        toProcess.push({ url, mimeType, fileBuffer });
      } catch (fileErr) {
        console.error("[batch] failed to upload file:", fileErr);
      }
    }

    if (uploaded.length === 0) {
      return res.status(500).json({ error: "All file uploads failed" });
    }

    visit.attachments.push(...uploaded);

    // Mark processing only if not already ready (avoid clobbering a completed report)
    await Visit.updateOne(
      { _id: visit._id, status: { $ne: "ready" } },
      { $set: { status: "processing", entryMethod: "scan" } }
    );
    visit.status = "processing";
    visit.entryMethod = "scan";
    await visit.save();

    // Wait for the persistence above to be safe, then process each uploaded file
    const visitIdStr = visit._id.toString();
    for (const p of toProcess) {
      processReport(visitIdStr, p.url, p.mimeType, p.fileBuffer).catch((err) =>
        console.error("[pipeline] processing error:", err)
      );
    }

    return res.json(visit);
  } catch (err) {
    console.error("[visits] batch attachment error:", err);
    return res.status(500).json({ error: "Failed to upload attachments" });
  }
}

/** Background: OCR → extract → summarize */
async function processReport(visitId: string, fileUrl: string, fileType: string, fileBuffer?: Buffer) {
  const visit = await Visit.findById(visitId);
  if (!visit) return;

  const finalize = async (extractedFields: any, doctorName?: string) => {
    const update: any = { $set: { extractedFields, status: "ready" } };
    if (doctorName) update.$set.doctorName = doctorName;
    // Atomic update — this write wins over any stale "processing" write.
    await Visit.findByIdAndUpdate(visitId, update, { new: true });
  };

  try {
    let ocrText = "";

    if (fileType === "application/pdf" || fileType === "pdf") {
      // PDF: extract text directly using pdf-parse
      console.log("[pipeline] processing PDF...");
      const pdfData = fileBuffer
        ? await pdfParse(fileBuffer)
        : await pdfParse(Buffer.from(await (await fetch(fileUrl)).arrayBuffer()));
      ocrText = pdfData.text || "";
      console.log("[pipeline] PDF text extracted:", ocrText.length, "chars");
    } else {
      // Image: use vision model for OCR
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      ocrText = await extractTextFromImage(base64);
    }

    if (!ocrText.trim()) {
      // No text extracted — mark as ready with a note
      await finalize({
        diagnosis: null,
        medication: null,
        plainLanguageSummary: fileType.includes("pdf")
          ? "PDF uploaded successfully. Text extraction returned no content. You can view the PDF in the visit details."
          : "Report photo uploaded successfully. AI text extraction is not available for this image type. You can view the photo in the visit details.",
        testResults: [],
      });
      console.log("[pipeline] no text extracted, saved as ready");
      return;
    }

    // Extract structured fields from text
    const extractedFields = await extractReportFields(ocrText);

    // Generate plain-language summary
    const plainLanguageSummary = await generatePlainLanguageSummary(ocrText, extractedFields);

    const doctorName = !visit.doctorName && extractedFields.doctorName ? extractedFields.doctorName : undefined;

    await finalize(
      {
        diagnosis: extractedFields.diagnosis || null,
        medication: extractedFields.medication || null,
        plainLanguageSummary,
        testResults: extractedFields.testResults || [],
      },
      doctorName
    );
    console.log("[pipeline] processing complete, status: ready");
  } catch (err) {
    console.error("[pipeline] failed:", err);
    // Don't mark as failed — keep it "ready" with the file attached
    await finalize({
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Report uploaded. AI processing encountered an error. Please consult your doctor for interpretation.",
      testResults: [],
    });
  }
}

/** GET /api/visits — timeline with filters */
export async function listVisits(req: AuthedRequest, res: Response) {
  try {
    const { from, to, hospitalId, tag, status } = req.query;
    const filter: any = { userId: req.userId };

    if (from || to) {
      filter.visitDate = {};
      if (from) filter.visitDate.$gte = new Date(from as string);
      if (to) filter.visitDate.$lte = new Date(to as string);
    }
    if (hospitalId) filter.hospitalId = hospitalId;
    if (tag) filter.tag = tag;
    if (status) filter.status = status;

    const visits = await Visit.find(filter)
      .populate("hospitalId", "name location type")
      .sort({ visitDate: -1 });

    return res.json(visits);
  } catch (err) {
    console.error("[visits] list error:", err);
    return res.status(500).json({ error: "Failed to fetch visits" });
  }
}

/** GET /api/visits/:id — visit detail */
export async function getVisit(req: AuthedRequest, res: Response) {
  try {
    let visit = await Visit.findOne({ _id: req.params.id, userId: req.userId })
      .populate({
        path: "hospitalId",
        select: "name location type isGlobal",
      });

    if (!visit) {
      const user = await User.findById(req.userId);
      const isCareCircleMember = user?.careCircleMembers.some(
        (id) => id.toString() === req.params.id
      );
      if (!isCareCircleMember) {
        const possibleVisit = await Visit.findById(req.params.id).select("userId");
        if (possibleVisit && user?.careCircleMembers.some((id) => id.toString() === possibleVisit.userId.toString())) {
          visit = await Visit.findById(req.params.id).populate({
            path: "hospitalId",
            select: "name location type isGlobal",
          });
        }
      }
    }

    if (!visit) return res.status(404).json({ error: "Visit not found" });
    return res.json(visit);
  } catch (err) {
    console.error("[visits] get error:", err);
    return res.status(500).json({ error: "Failed to fetch visit" });
  }
}

/** PUT /api/visits/:id — update a visit */
export async function updateVisit(req: AuthedRequest, res: Response) {
  try {
    const visit = await Visit.findOne({ _id: req.params.id, userId: req.userId });
    if (!visit) return res.status(404).json({ error: "Visit not found" });

    const { hospitalId, visitDate, doctorName, reason, tag } = req.body;

    if (hospitalId && hospitalId !== visit.hospitalId.toString()) {
      const targetHospital = await Hospital.findOne({
        _id: hospitalId,
        $or: [{ isGlobal: true }, { userId: req.userId }],
      });
      if (!targetHospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }
      await Hospital.findByIdAndUpdate(visit.hospitalId, { $inc: { visitCount: -1 } });
      await Hospital.findByIdAndUpdate(hospitalId, { $inc: { visitCount: 1 } });
    }

    const updateFields: any = {};
    if (hospitalId !== undefined) updateFields.hospitalId = hospitalId;
    if (visitDate !== undefined) updateFields.visitDate = visitDate;
    if (doctorName !== undefined) updateFields.doctorName = doctorName;
    if (reason !== undefined) updateFields.reason = reason;
    if (tag !== undefined) updateFields.tag = tag;

    Object.assign(visit, updateFields);
    await visit.save();

    const populated = await visit.populate("hospitalId", "name location type");
    return res.json(populated);
  } catch (err) {
    console.error("[visits] update error:", err);
    return res.status(500).json({ error: "Failed to update visit" });
  }
}

/** DELETE /api/visits/:id — delete a visit and its attachments */
export async function deleteVisit(req: AuthedRequest, res: Response) {
  try {
    const visit = await Visit.findOne({ _id: req.params.id, userId: req.userId });
    if (!visit) return res.status(404).json({ error: "Visit not found" });

    // Delete Cloudinary attachments
    for (const att of visit.attachments) {
      try {
        await deleteFromCloudinary(att.cloudinaryPublicId);
      } catch (e) {
        console.error("[visits] failed to delete attachment:", att.cloudinaryPublicId);
      }
    }

    await Hospital.findByIdAndUpdate(visit.hospitalId, { $inc: { visitCount: -1 } });
    await Visit.findByIdAndDelete(visit._id);

    return res.json({ message: "Visit deleted" });
  } catch (err) {
    console.error("[visits] delete error:", err);
    return res.status(500).json({ error: "Failed to delete visit" });
  }
}

/** DELETE /api/visits/:id/attachments/:attIndex — delete a single attachment */
export async function deleteAttachment(req: AuthedRequest, res: Response) {
  try {
    const visit = await Visit.findOne({ _id: req.params.id, userId: req.userId });
    if (!visit) return res.status(404).json({ error: "Visit not found" });

    const attIndex = parseInt(req.params.attIndex, 10);
    if (isNaN(attIndex) || attIndex < 0 || attIndex >= visit.attachments.length) {
      return res.status(400).json({ error: "Invalid attachment index" });
    }

    const [attachment] = visit.attachments.splice(attIndex, 1);

    if (attachment?.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(attachment.cloudinaryPublicId);
      } catch (e) {
        console.error("[visits] failed to delete attachment from cloudinary:", attachment.cloudinaryPublicId);
      }
    }

    // If deleting the AI-processed file, clear extracted fields and reset status
    if (visit.extractedFields?.plainLanguageSummary) {
      visit.extractedFields = {
        diagnosis: null,
        medication: null,
        plainLanguageSummary: null,
        testResults: [],
      };
    }
    visit.status = visit.attachments.length > 0 ? "processing" : "ready";
    await visit.save();

    const populated = await visit.populate({ path: "hospitalId", select: "name location type isGlobal" });
    return res.json(populated);
  } catch (err) {
    console.error("[visits] delete attachment error:", err);
    return res.status(500).json({ error: "Failed to delete attachment" });
  }
}
