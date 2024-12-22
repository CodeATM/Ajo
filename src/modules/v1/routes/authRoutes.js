import { Router } from "express";
import {
  activateAccount,
  changePassword,
  loginUser,
  register,
} from "../controllers/auth.controller.js";
const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", loginUser);
authRoutes.post("/change-password", changePassword);
authRoutes.post("/activate-account", activateAccount);

export default authRoutes;
