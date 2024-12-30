import { BadRequestError } from "../../../middlewares/error.middleware.js";
import {
  cancelPlanService,
  createPlanService,
  getPlanService,
  updatePlan,
} from "../../../services/planService/index.js";
import { flwActivateSubscription } from "../../../utils/flutterwave.js";
import { successResponse } from "../../../utils/response.js";

// create a paln
export const createAplan = async (req, res, next) => {
  try {
    const { duration, amount, interval, name, planType, description } =
      req.body;
    const userId = req.user;
    const data = await createPlanService({
      duration,
      amount,
      interval,
      name,
      planType,
      description,
      userId,
    });
    await successResponse(res, 201, "plan created successfully", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const UpdatePlan = async (req, res, next) => {
  try {
    const { description, name } = req.body;
    const user = req.user;
    const { planId } = req.params;
    const data = await updatePlan({ name, planId, user, description });

    await successResponse(res, 200, "Plan updated", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const cancelPlan = async (req, res, next) => {
  try {
    const user = req.user;
    const { planId } = req.params;
    const data = await cancelPlanService({ planId, user });

    await successResponse(res, 200, "Plan updated", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllPlans = async (req, res, next) => {
  try {
    await flwActivateSubscription(71317);
    const data = await getPlanService();
    await successResponse(res, 200, "Plans fetched successfully.", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    if (!planId) {
      throw new BadRequestError("Missing a planId.");
    }
    const data = await getPlanService(planId);
    await successResponse(res, 200, "Plans fetched successfully.", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
