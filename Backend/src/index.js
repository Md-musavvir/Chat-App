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
const onlineUsers = new Map();
const lastSeen = new Map();

connectDb()
  .then(() => {
    app.on("error", (error) => {
      console.error("Express App Error:", error);
    });

    io.on("connection", (socket) => {
      socket.on("setup", (user) => {
        if (!user || !user._id) {
          console.error("❌ Invalid user data in setup");
          return;
        }
        onlineUsers.set(user._id.toString(), socket.id);
        lastSeen.delete(user._id.toString());
        io.emit("online-users", Array.from(onlineUsers.keys()));

        socket.join(user._id);
        socket.emit("connected");
      });

      socket.on("join room", (room) => {
        if (!room) {
          console.error("❌ Invalid room ID");
          return;
        }

        socket.join(room);
      });

      socket.on("leave room", (room) => {
        socket.leave(room);
      });

      socket.on("new message", (receivedMessage) => {
        try {
          const chat = receivedMessage.chat;

          if (!chat || !chat.users) {
            console.error("❌ Invalid chat data - users not defined");
            return;
          }

          chat.users.forEach((user) => {
            if (user._id === receivedMessage.sender._id) {
              return;
            }

            io.to(user._id.toString()).emit(
              "message received",
              receivedMessage,
            );
          });
        } catch (error) {
          console.error("❌ Error handling new message:", error);
        }
      });

      socket.on("typing", (room) => {
        socket.to(room).emit("typing", room);
      });

      socket.on("stop typing", (room) => {
        socket.to(room).emit("stop typing", room);
      });

      socket.on("disconnect", () => {
        for (const [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            lastSeen.set(userId, new Date());
            onlineUsers.delete(userId);
            break;
          }
        }

        io.emit("online-users", Array.from(onlineUsers.keys()));
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
