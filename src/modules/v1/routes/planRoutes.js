import { Router } from "express";
import {
  // cancelPlan,
  createAplan,
  getAllPlans,
  getPlan,
  getUserPlan,
  UpdatePlan,
} from "../controllers/plan.controller.js";
import { verify } from "../../../middlewares/verify.middleware.js";
const planRoutes = Router();

planRoutes.post("/create-plan", verify, createAplan);
planRoutes.put("/update-plan/:planId", verify, UpdatePlan);
// planRoutes.put("/cancel-plan/:planId", verify, cancelPlan);
planRoutes.get("/", verify, getAllPlans);
planRoutes.get("/", verify, getUserPlan);
planRoutes.get("/:planId", verify, getPlan);

export default planRoutes;
