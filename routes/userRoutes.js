const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const { getContacts } = require("../controllers/userController");

router.get("/contacts", authenticate, getContacts);

module.exports = router;