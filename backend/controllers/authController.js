const User = require("../models/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");


// Helper: Generate OTP

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();


// Helper: Sign JWT

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};


// REGISTER USER

exports.registerUser = async (req, res) => {
  try {
    const { name, mobile, aadhaar, address } = req.body;

    if (!name || !mobile || !aadhaar) {
      return res
        .status(400)
        .json({ message: "Name, mobile and Aadhaar are required" });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    if (!/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({ message: "Invalid Aadhaar number" });
    }

    // Check duplicates
    if (await User.findOne({ mobile })) {
      return res.status(400).json({ message: "Mobile already registered" });
    }
    if (await User.findOne({ aadhaar })) {
      return res.status(400).json({ message: "Aadhaar already registered" });
    }

    const user = new User({ name, mobile, aadhaar, address });
    await user.save();

    res.status(201).json({ message: "Registration successful!" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// SEND OTP USING 2FACTOR

exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "Mobile not registered" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Send OTP using 2Factor
    const apiKey = process.env.TWO_FACTOR_API_KEY;

    await axios.get(
      `https://2factor.in/API/V1/${apiKey}/SMS/${mobile}/${otp}/OTP`
    );

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


// VERIFY OTP

exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.otp) return res.status(400).json({ message: "No OTP generated" });
    if (Date.now() > user.otpExpires)
      return res.status(400).json({ message: "OTP expired" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    // Clear OTP fields
    user.otp = "";
    user.otpExpires = null;
    await user.save();

    const token = signToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error verifying OTP" });
  }
};


// GET LOGGED-IN USER

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-otp -otpExpires")
      .populate("votedFor", "name")
      .populate("votedElection", "title");

    res.json(user);
  } catch (err) {
    console.error("GetMe Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
