import { Schema, model, Document, Types } from "mongoose";

export interface IVisit extends Document {
  userId: Types.ObjectId;
  hospitalId: Types.ObjectId;
  visitDate: Date;
  doctorName: string;
  reason: string;
  tag: "consultation" | "lab_test" | "prescription" | "vaccination" | "surgery" | "other";
  status: "processing" | "ready" | "failed";
  entryMethod: "scan" | "manual";
  attachments: Array<{
    fileUrl: string;
    fileType: string;
    cloudinaryPublicId: string;
    name: string;
    size: number;
    createdAt?: Date;
  }>;
  extractedFields: {
    diagnosis: string | null;
    medication: string | null;
    plainLanguageSummary: string | null;
    testResults: Array<{
      testName: string;
      value: number;
      unit: string;
      referenceRange: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const visitSchema = new Schema<IVisit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
    visitDate: { type: Date, required: true },
    doctorName: { type: String, default: "" },
    reason: { type: String, default: "" },
    tag: {
      type: String,
      enum: ["consultation", "lab_test", "prescription", "vaccination", "surgery", "other"],
      default: "other",
    },
    status: { type: String, enum: ["processing", "ready", "failed"], default: "ready" },
    entryMethod: { type: String, enum: ["scan", "manual"], default: "manual" },
    attachments: [
      {
        fileUrl: { type: String, required: true },
        fileType: { type: String, required: true },
        cloudinaryPublicId: { type: String, required: true },
        name: { type: String, default: "" },
        size: { type: Number, default: 0 },
        createdAt: { type: Date, default: () => new Date() },
      },
    ],
    extractedFields: {
      diagnosis: { type: String, default: null },
      medication: { type: String, default: null },
      plainLanguageSummary: { type: String, default: null },
      testResults: [
        {
          testName: { type: String },
          value: { type: Number },
          unit: { type: String },
          referenceRange: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

export const Visit = model<IVisit>("Visit", visitSchema);
