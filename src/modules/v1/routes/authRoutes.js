import { Router } from "express";
import {
  activateAccount,
  changePassword,
  loginUser,
  register,
  refreshToken,
  getOtp,
  resetPassword,
} from "../controllers/auth.controller.js";
const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/refresh", refreshToken);
authRoutes.post("/login", loginUser);
authRoutes.post("/change-password", changePassword);
authRoutes.post("/request-token", getOtp);
authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/activate-account", activateAccount);

export default authRoutes;
