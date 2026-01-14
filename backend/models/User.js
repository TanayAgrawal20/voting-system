const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    mobile: { type: String, required: true, unique: true }, // 10-digit mobile
    aadhaar: { type: String, required: true, unique: true }, // 12-digit Aadhaar
    address: { type: String, default: "" },

    // OTP System
    otp: { type: String },
    otpExpires: { type: Date },

    // Roles
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Voting status
    hasVoted: { type: Boolean, default: false },
    votedElection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      default: null,
    },
    votedFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
