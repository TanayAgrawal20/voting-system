const express = require("express");
const router = express.Router();

const Election = require("../models/Election");
const Candidate = require("../models/Candidate");

// =================================================
// ADMIN: GET ALL ELECTIONS
// URL: GET /api/elections/admin/elections
// =================================================
router.get("api/elections/admin/elections", async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.status(200).json(elections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =================================================
// GET ACTIVE ELECTION
// URL: GET /api/elections/active
// =================================================
router.get("/active", async (req, res) => {
  try {
    const election = await Election.findOne({ status: "active" });
    res.json({ election });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// =================================================
// GET PAST ELECTIONS
// URL: GET /api/elections/past
// =================================================
router.get("/past", async (req, res) => {
  try {
    const elections = await Election.find({ status: "past" });
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// =================================================
// GET UPCOMING ELECTIONS
// URL: GET /api/elections/upcoming
// =================================================
router.get("/upcoming", async (req, res) => {
  try {
    const elections = await Election.find({ status: "upcoming" });
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// =================================================
// GET CANDIDATES BY ELECTION
// URL: GET /api/elections/candidates/:electionId
// =================================================
router.get("/candidates/:electionId", async (req, res) => {
  try {
    const candidates = await Candidate.find({
      electionId: req.params.electionId,
    });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/admin/start-election/:id", async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (election.status === "past") {
      return res.status(403).json({
        message: "Past election cannot be restarted",
      });
    }

    election.status = "active";
    await election.save();

    return res.status(200).json({
      message: "Election started successfully",
    });
  } catch (err) {
    // ✅ HANDLE EXPECTED ERROR (NO LOG)
    if (err.message === "Past election cannot be restarted") {
      return res.status(403).json({ message: err.message });
    }

    // ❌ LOG ONLY UNEXPECTED ERRORS
    console.error("Unexpected error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// =================================================
// GET SINGLE ELECTION (KEEP LAST)
// URL: GET /api/elections/:id
// =================================================
router.get("/:id", async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election)
      return res.status(404).json({ message: "Election not found" });

    res.json(election);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;



router.get("/admin/elections", async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

