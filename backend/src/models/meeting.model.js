import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
  {
    // The owning user's id. Previously this stored the *username*, so renaming a
    // user orphaned their history; it was also unindexed despite being the only
    // field ever queried.
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    meetingCode: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

// History is always read newest-first for one user.
meetingSchema.index({ user_id: 1, date: -1 });

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };
