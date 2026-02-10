import { Router } from "express";

import {
  accessChat,
  addToGroup,
  createGroup,
  fetchChat,
  removeFromGroup,
} from "../controllers/chat.controller.js";
import verifyJwt from "../middlewares/verifyJwt.js";

const router = Router();
router.use(verifyJwt);
router.post("/accessChat", accessChat);
router.get("/fetchchat", fetchChat);
router.post("/creategroup", createGroup);
router.put("/addToGroup", addToGroup);
router.put("/removeFromGroup", removeFromGroup);
export default router;
