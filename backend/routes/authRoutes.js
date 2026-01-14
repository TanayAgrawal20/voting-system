const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const {
  registerUser,
  sendOtp,
  verifyOtp,
  getMe,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", authMiddleware, getMe);

module.exports = router;
