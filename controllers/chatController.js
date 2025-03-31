const Chat = require("../models/Chat");

exports.getMessages = async (req, res) => {
  try {
    const messages = await Chat.find({
      $or: [{ sender: req.user.mobile }, { receiver: req.user.mobile }],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMessagesWithContact = async (req, res) => {
  try {
    const messages = await Chat.find({
      $or: [
        { sender: req.user.mobile, receiver: req.params.contact },
        { sender: req.params.contact, receiver: req.user.mobile },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Chat.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};