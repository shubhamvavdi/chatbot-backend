const User = require("../models/User");

exports.getContacts = async (req, res) => {
  try {
    const contacts = await User.find({ mobile: { $ne: req.user.mobile } });
    res.json(contacts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};