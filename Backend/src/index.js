import { createServer } from "node:http";

import dotenv from "dotenv";
import { Server } from "socket.io";

import app from "./app.js";
import connectDb from "./db/dbConnection.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
  pingTimeout: 60000,
});

connectDb()
  .then(() => {
    app.on("error", (error) => {
      console.error("Express App Error:", error);
    });

    io.on("connection", (socket) => {
      console.log("🔌 Socket connected:", socket.id);
      console.log("   Total connections:", io.sockets.sockets.size);

      socket.on("setup", (user) => {
        if (!user || !user._id) {
          console.error("❌ Invalid user data in setup");
          return;
        }

        socket.join(user._id);
        socket.emit("connected");
        console.log(
          `✅ User ${user.username || user._id} joined personal room: ${user._id}`,
        );
      });

      socket.on("join room", (room) => {
        if (!room) {
          console.error("❌ Invalid room ID");
          return;
        }

        socket.join(room);
        console.log(`👥 Socket ${socket.id} joined chat room: ${room}`);
      });

      socket.on("leave room", (room) => {
        socket.leave(room);
        console.log(`👋 Socket ${socket.id} left chat room: ${room}`);
      });

      socket.on("new message", (receivedMessage) => {
        try {
          const chat = receivedMessage.chat;

          if (!chat || !chat.users) {
            console.error("❌ Invalid chat data - users not defined");
            return;
          }

          console.log(`📨 New message in chat: ${chat._id}`);
          console.log(
            `   From: ${receivedMessage.sender.username || receivedMessage.sender._id}`,
          );
          console.log(`   Content: ${receivedMessage.content}`);

          chat.users.forEach((user) => {
            if (user._id === receivedMessage.sender._id) {
              console.log(`   ⏭️  Skipping sender: ${user._id}`);
              return;
            }

            console.log(`   📤 Emitting to user: ${user._id}`);

            io.to(user._id.toString()).emit(
              "message received",
              receivedMessage,
            );
          });

          console.log(`✅ Message broadcast complete`);
        } catch (error) {
          console.error("❌ Error handling new message:", error);
        }
      });

      socket.on("typing", (room) => {
        console.log(`⌨️  Typing in room: ${room}`);
        socket.to(room).emit("typing", room);
      });

      socket.on("stop typing", (room) => {
        console.log(`⌨️  Stopped typing in room: ${room}`);
        socket.to(room).emit("stop typing", room);
      });

      socket.on("disconnect", (reason) => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
        console.log(`   Reason: ${reason}`);
        console.log("   Total connections:", io.sockets.sockets.size);
      });

      socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
      });
    });

    server.listen(PORT, () => {
      console.log(`✅ Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed!", error);
    process.exit(1);
  });

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});
