const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ success: false, error: { message: "Missing fields" } });
  const existing = await User.findOne({ email });
  if (existing)
    return res
      .status(400)
      .json({ success: false, error: { message: "User exists" } });
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email, passwordHash });
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET || "secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    },
  });
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, error: { message: "Missing fields" } });
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(400)
      .json({ success: false, error: { message: "Invalid credentials" } });
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch)
    return res
      .status(400)
      .json({ success: false, error: { message: "Invalid credentials" } });
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET || "secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    },
  });
});

module.exports = router;
