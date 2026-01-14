const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Create election
router.post(
  "/create-election",
  authMiddleware,
  adminOnly,
  adminController.createElection
);

// Get all elections
router.get(
  "/elections",
  authMiddleware,
  adminOnly,
  adminController.getAllElections
);

// Delete election
router.delete(
  "/delete-election/:id",
  authMiddleware,
  adminOnly,
  adminController.deleteElection
);

// Add candidate
router.post(
  "/add-candidate",
  authMiddleware,
  adminOnly,
  upload.fields([
    { name: "candidatePhoto", maxCount: 1 },
    { name: "partySymbol", maxCount: 1 },
  ]),
  adminController.addCandidate
);

// Start election
router.patch(
  "/start-election/:id",
  authMiddleware,
  adminOnly,
  adminController.startElection
);

// Stop election
router.patch(
  "/stop-election/:id",
  authMiddleware,
  adminOnly,
  adminController.stopElection
);

// Get candidates by election
router.get(
  "/candidates/:electionId",
  authMiddleware,
  adminOnly,
  adminController.getCandidatesByElection
);

module.exports = router;
