const Vote = require("../models/Vote");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const User = require("../models/User");

exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user._id;

    // Check if user already voted
    const existingVote = await Vote.findOne({
      user: userId,
      election: electionId,
    });

    if (existingVote) {
      return res.status(400).json({ message: "You already voted" });
    }

    // Save vote
    await Vote.create({
      user: userId,
      election: electionId,
      candidate: candidateId,
    });

    // ✅ UPDATE USER STATUS
    await User.findByIdAndUpdate(userId, {
      hasVoted: true,
      votedElection: electionId,
      votedFor: candidateId,
    });

    // ✅ UPDATE CANDIDATE VOTES
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { votes: 1 } },
      { new: true }
    );

    console.log("UPDATED CANDIDATE:", updatedCandidate);

    // Fetch fresh data
    const candidates = await Candidate.find({ electionId })
      .select("name votes candidatePhoto partyName")
      .lean();

    // Emit live update
    const io = req.app.get("io");
    io.emit("voteUpdate", {
      electionId,
      candidates,
    });

    res.json({ message: "Vote recorded successfully" });

  } catch (err) {
    console.error("Vote Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
