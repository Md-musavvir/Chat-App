import { Router } from "express";

import {
  getUser,
  loginUser,
  registerUser,
} from "../controllers/user.controller.js";
import verifyJwt from "../middlewares/verifyJwt.js";

const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.use(verifyJwt);
router.get("/getUser", getUser);

export default router;
