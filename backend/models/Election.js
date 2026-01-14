const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["upcoming", "active", "past"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

// Block findOneAndUpdate / findByIdAndUpdate
electionSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const election = await this.model.findOne(this.getQuery());

  if (
    election &&
    election.status === "past" &&
    update?.status &&
    update.status !== "past"
  ) {
    return next(new Error("Past election cannot be restarted"));
  }

  next();
});

// Block save()
electionSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("status")) {
    if (this._previousStatus === "past") {
      return next(new Error("Past election cannot be restarted"));
    }
  }
  next();
});

// Track previous status
electionSchema.pre("init", function (doc) {
  this._previousStatus = doc.status;
});

module.exports = mongoose.model("Election", electionSchema);
