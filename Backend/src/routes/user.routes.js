import { Router } from "express";

import { loginUser, registerUser } from "../controllers/user.controller.js";
import verifyJwt from "../middlewares/verifyJwt.js";

const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.use(verifyJwt);

export default router;
