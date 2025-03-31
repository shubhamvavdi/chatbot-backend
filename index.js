const http = require("http");
const app = require("./app");
const initializeSocket = require("./services/socketService");

const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "https://merry-tulumba-b7c415.netlify.app" } });

// Initialize Socket.io
initializeSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));