const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api", authRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api", userRoutes);

// Error handling
app.use(errorHandler);

// Database connection
connectDB();

module.exports = app;