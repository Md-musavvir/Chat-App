import { Router } from "express";

import {
  getAllMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import verifyJwt from "../middlewares/verifyJwt.js";

const router = Router();
router.use(verifyJwt);
router.post("/sendMessage", sendMessage);
router.get("/getAllMessages/:chatId", getAllMessages);
export default router;
