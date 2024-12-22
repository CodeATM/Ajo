import { Router } from "express";
import {
  deleteUser,
  getUsers,
  oneUser,
  updateUser,
} from "../controllers/user.controller.js";
const userRoutes = Router();

userRoutes.patch("/update-user/:userId", updateUser);
userRoutes.get("/", getUsers);
userRoutes.get("/:userId", oneUser);
userRoutes.delete("/delete-user/:userId", deleteUser);

export default userRoutes;
