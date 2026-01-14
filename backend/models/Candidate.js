const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },

  name: { type: String, required: true },
  partyName: String,
  description: String,

  candidatePhoto: String,
  partySymbol: String,

  votes: {
    type: Number,
    default: 0,   // 🔴 REQUIRED
  },
});

module.exports = mongoose.model("Candidate", candidateSchema);
