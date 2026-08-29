import { Schema, model, Document, Types } from "mongoose";

export interface IShareLink extends Document {
  userId: Types.ObjectId;
  scope: "all" | "lastNVisits" | "dateRange" | "singleVisit";
  scopeParams: {
    lastN?: number;
    from?: Date;
    to?: Date;
    hospitalId?: Types.ObjectId;
    visitId?: Types.ObjectId;
  };
  token: string;
  oneTimeUse: boolean;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const shareLinkSchema = new Schema<IShareLink>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  scope: { type: String, enum: ["all", "lastNVisits", "dateRange", "singleVisit"], default: "all" },
  scopeParams: { type: Schema.Types.Mixed, default: {} },
  token: { type: String, required: true, unique: true },
  oneTimeUse: { type: Boolean, default: false },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ShareLink = model<IShareLink>("ShareLink", shareLinkSchema);
