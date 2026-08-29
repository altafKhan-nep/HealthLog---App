import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  careCircleMembers: Types.ObjectId[];
  profilePicture: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: string;
  bloodType: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  careCircleMembers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  profilePicture: { type: String, default: "" },
  phone: { type: String, default: "" },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, default: "" },
  bloodType: { type: String, default: "" },
  emergencyContact: {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    relationship: { type: String, default: "" },
  },
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", userSchema);
