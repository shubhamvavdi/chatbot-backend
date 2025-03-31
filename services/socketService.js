const Chat = require("../models/Chat");

const initializeSocket = (io) => {
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

    socket.on("messageDeleted", (messageId) => {
      io.emit("messageDeleted", messageId);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;





