const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://SHUBHAM:shubham1@e-com.pjrx1.mongodb.net/whatsapp_clone?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    }
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  mobile: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

const chatSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});
const Chat = mongoose.model("Chat", chatSchema);

const JWT_SECRET = "shubham123";

// Middleware for Authentication
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

// Routes
app.post("/api/register", async (req, res) => {
  try {
    const { name, mobile, password } = req.body;

    if (!mobile.match(/^[0-9]{10}$/)) {
      return res.status(400).json({ error: "Mobile must be 10 digits" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      mobile,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ success: true, user });
  } catch (err) {
    if (err.name === "MongoError" && err.code === 11000) {
      return res.status(400).json({ error: "Mobile number already exists" });
    }
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
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
});

app.get("/api/contacts", authenticate, async (req, res) => {
  try {
    const contacts = await User.find({ mobile: { $ne: req.user.mobile } });
    res.json(contacts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/messages", authenticate, async (req, res) => {
  try {
    const messages = await Chat.find({
      $or: [{ sender: req.user.mobile }, { receiver: req.user.mobile }],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/messages/:contact", authenticate, async (req, res) => {
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
});
// Add to your server's index.js
app.delete("/api/messages/:id", authenticate, async (req, res) => {
  try {
    const message = await Chat.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    io.emit("messageDeleted", req.params.id); // Notify all clients
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Socket.io
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    try {
      const chat = new Chat(data);
      await chat.save();
      io.emit("receiveMessage", data);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("✅ Server running on port 5000"));