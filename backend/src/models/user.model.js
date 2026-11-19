import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      // Stored lowercase so `Bob` and `bob` collide on the unique index instead
      // of becoming two accounts that render identically.
      lowercase: true,
      trim: true,
      index: true,
    },
    // Excluded from queries by default; login opts back in with .select("+password").
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export { User };
