import { Schema, model, Document, Types } from "mongoose";

export interface IHospital extends Document {
  userId: Types.ObjectId | null;
  name: string;
  type: "hospital" | "clinic";
  location: string;
  isGlobal: boolean;
  firstVisitDate: Date;
  lastVisitDate: Date;
  visitCount: number;
  createdAt: Date;
}

const hospitalSchema = new Schema<IHospital>({
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ["hospital", "clinic"], default: "hospital" },
  location: { type: String, default: "" },
  isGlobal: { type: Boolean, default: false },
  firstVisitDate: { type: Date },
  lastVisitDate: { type: Date },
  visitCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

hospitalSchema.index({ userId: 1, name: 1 }, { unique: true, partialFilterExpression: { userId: { $ne: null } } });

export const Hospital = model<IHospital>("Hospital", hospitalSchema);
