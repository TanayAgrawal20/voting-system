const express = require("express");
const router = express.Router();

const Election = require("../models/Election");
const Candidate = require("../models/Candidate");

// PUBLIC: GET all elections (no auth needed)
router.get("/elections", async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    console.error("PUBLIC ELECTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUBLIC: GET candidates for an election
router.get("/candidates/:electionId", async (req, res) => {
  try {
    const candidates = await Candidate.find({
      electionId: req.params.electionId,
    });

    res.json(candidates);
  } catch (err) {
    console.error("PUBLIC CANDIDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
