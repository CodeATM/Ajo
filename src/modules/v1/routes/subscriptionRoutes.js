import { Router } from "express";
import { subscribeUser } from "../controllers/subscription.controller.js";
import { verify } from "../../../middlewares/verify.middleware.js";
const subscriptionRoutes = Router();

subscriptionRoutes.post("/:planId", verify, subscribeUser);

export default subscriptionRoutes;
