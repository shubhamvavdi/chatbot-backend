const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);

// ✅ Allowed Origins for CORS
const allowedOrigins = [
  "https://merry-tulumba-b7c415.netlify.app",
];

// ✅ Configure CORS
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ Routes
app.use("/api", authRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api", userRoutes);

// ✅ Error Handling
app.use(errorHandler);

// ✅ Database Connection
connectDB();

// ✅ Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// ✅ Socket.io Events
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", (data) => {
    console.log("Message received:", data);
    io.emit("message", data); // Broadcast message
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// ✅ Export Server (for index.js)
module.exports = { app, server };
