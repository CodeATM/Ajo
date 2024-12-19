import { Router } from "express";
import { activateAccount, register } from "../controllers/auth.controller.js";
const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/activate-account", activateAccount);

export default authRoutes;
