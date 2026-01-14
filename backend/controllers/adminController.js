const Election = require("../models/Election");
const Candidate = require("../models/Candidate");

// CREATE ELECTION
exports.createElection = async (req, res) => {
  try {
    const { title, type, description } = req.body;

    if (!title || !type) {
      return res
        .status(400)
        .json({ message: "Title and Election Type required" });
    }

    const election = await Election.create({ title, type, description });

    res.status(201).json({
      message: "Election created successfully",
      election,
    });
  } catch (err) {
    console.error("Create Election Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL ELECTIONS
exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    console.error("Get Elections Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ELECTION CATEGORIES
exports.getElectionCategories = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });

    res.json({
      upcoming: elections.filter((e) => e.status === "upcoming"),
      active: elections.filter((e) => e.status === "active"),
      past: elections.filter((e) => e.status === "past"),
    });
  } catch (err) {
    console.error("Category Election Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE ELECTION
exports.deleteElection = async (req, res) => {
  try {
    const { id } = req.params;

    await Candidate.deleteMany({ electionId: id });
    await Election.findByIdAndDelete(id);

    res.json({ message: "Election deleted successfully" });
  } catch (err) {
    console.error("Delete Election Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ADD CANDIDATE (FIXED)
exports.addCandidate = async (req, res) => {
  try {
    const { electionId, name, partyName, description } = req.body;

    if (!electionId || !name || !partyName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (election.status !== "upcoming") {
      return res
        .status(400)
        .json({ message: "Cannot add candidates to active or past election" });
    }

    // 🔴 GUARANTEED SAFE IMAGE HANDLING
    const candidatePhoto =
      req.files && req.files.candidatePhoto
        ? req.files.candidatePhoto[0].filename
        : "default.png";

    const partySymbol =
      req.files && req.files.partySymbol
        ? req.files.partySymbol[0].filename
        : null;

    const candidate = await Candidate.create({
      electionId,
      name,
      partyName,
      description,
      candidatePhoto,
      partySymbol,
    });

    res.status(201).json({
      message: "Candidate added successfully",
      candidate,
    });
  } catch (err) {
    console.error("Add Candidate Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// START ELECTION
exports.startElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    election.status = "active";
    await election.save();

    res.json({ message: "Election started successfully", election });
  } catch (err) {
    console.error("Start Election Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// STOP ELECTION
exports.stopElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    election.status = "past";
    await election.save();

    res.json({ message: "Election stopped successfully", election });
  } catch (err) {
    console.error("Stop Election Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CANDIDATES BY ELECTION
exports.getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({
      electionId: req.params.electionId,
    });

    res.json(candidates);
  } catch (err) {
    console.error("Get Candidates Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
