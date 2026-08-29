import { Schema, model, Document, Types } from "mongoose";

export interface ICareCircleRequest extends Document {
  code: string;
  ownerId: Types.ObjectId;
  requesterId: Types.ObjectId;
  role: string;
  status: "pending" | "approved" | "declined";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const careCircleRequestSchema = new Schema<ICareCircleRequest>(
  {
    code: { type: String, required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requesterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, default: "Family Member" },
    status: { type: String, enum: ["pending", "approved", "declined"], default: "pending" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

careCircleRequestSchema.index({ ownerId: 1, status: 1 });
careCircleRequestSchema.index({ code: 1, status: 1 });
careCircleRequestSchema.index({ ownerId: 1, requesterId: 1, status: 1 });

export const CareCircleRequest = model<ICareCircleRequest>(
  "CareCircleRequest",
  careCircleRequestSchema
);
