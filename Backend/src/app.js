import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(
  cors({
    origin: "https://chat-app-blond-tau-56.vercel.app",
    credentials: true,
  }),
);

app.use(express.json({ strict: false, limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messageRouter);
export default app;
