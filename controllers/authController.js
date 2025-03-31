const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/constants");

exports.register = async (req, res) => {
  try {
    const { name, mobile, password } = req.body;

    if (!mobile.match(/^[0-9]{10}$/)) {
      return res.status(400).json({ error: "Mobile must be 10 digits" });
    }

    const user = new User({ name, mobile, password });
    await user.save();
    
    res.status(201).json({ success: true, user });
  } catch (err) {
    if (err.name === "MongoError" && err.code === 11000) {
      return res.status(400).json({ error: "Mobile number already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ error: "User not found" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ mobile: user.mobile }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      token,
      user: { name: user.name, mobile: user.mobile },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};