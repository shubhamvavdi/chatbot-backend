const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const {
  getMessages,
  getMessagesWithContact,
  deleteMessage,
} = require("../controllers/chatController");

router.get("/", authenticate, getMessages);
router.get("/:contact", authenticate, getMessagesWithContact);
router.delete("/:id", authenticate, deleteMessage);

module.exports = router;