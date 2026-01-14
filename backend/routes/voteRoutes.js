const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

const { castVote } = require("../controllers/voteController");

// ✅ Route only delegates work
router.post("/vote", authMiddleware, castVote);

module.exports = router;
