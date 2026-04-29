import mongoose from "mongoose";

export type UserRole = "user" | "admin";

export type IUser = {
  name: string;
  email: string;
  clerkId: string;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, trim: true, sparse: true },
    clerkId: { type: String, unique: true, sparse: true },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
