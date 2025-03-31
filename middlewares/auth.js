const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/constants");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Access denied" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findOne({ mobile: decoded.mobile });
    if (!req.user) return res.status(404).json({ error: "User not found" });

    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = authenticate;