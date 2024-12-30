import Plan from "../../modules/v1/models/planModel/index.js";
import {
  flwCancelPlan,
  flwCreatePlan,
  flwUpdatePlan,
} from "../../utils/flutterwave.js";
import crypto from "crypto";
import { UserExistById } from "../userService/index.js";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../middlewares/error.middleware.js";

export const createPlanService = async ({
  duration,
  amount,
  interval,
  name,
  planType,
  description,
  userId,
}) => {
  // Create a plan on Flutterwave
  const plan = await flwCreatePlan({ duration, amount, interval, name });

  const user = await UserExistById(userId);
  if (!user) {
    throw new NotFoundError("User with this ID not found.");
  }
  const code = await referalCodeFunc();
  const newPlan = await Plan.create({
    plan_name: plan.name,
    plan_type: planType,
    flu_planid: plan.id,
    referalCode: code,
    description: description,
    amount: plan.amount,
    plan_span: plan.duration,
    plan_interval: plan.interval,
    plan_token: plan.plan_token,
    plan_admin: userId,
  });

  return newPlan;
};

export const updatePlan = async ({ name, planId, user, description }) => {
  // Prepare fields to update in the database
  const updateFields = {};

  const plan = await planValidations({ planId, user });
  if (name) {
    const flwResponse = await flwUpdatePlan({
      name: name || plan.plan_name,
      planId: plan.flu_planid,
    });

    if (flwResponse.status !== "success") {
      throw new BadRequestError("Failed to update plan on Flutterwave");
    }

    // Update the database fields for `name` and `activeStatus`
    if (name) updateFields.plan_name = name;
  }

  // Update any additional fields directly in the database (if any provided)
  const additionalFields = { ...updateFields, description };
  const updatedPlan = await Plan.findByIdAndUpdate(planId, additionalFields, {
    new: true,
  });

  return updatedPlan;
};

export const cancelPlanService = async ({ planId, user }) => {
  const plan = await planValidations({ planId, user });
  const res = await flwCancelPlan(plan.flu_planid);
  if (res.status !== "success") {
    throw new BadRequestError("Failed to cancel plan");
  }
  const updatedPlan = await Plan.findByIdAndUpdate(
    planId,
    { isPlanActive: false },
    {
      new: true,
    }
  );

  return updatedPlan;
};

export const getPlanService = async (planId) => {
  if (planId) {
    const res = await Plan.findById(planId);
    if (!res) {
      throw new NotFoundError("Plan not found");
    }
    return res;
  } else {
    const res = await Plan.find();
    return res;
  }
};

const planValidations = async ({ planId, user }) => {
  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new NotFoundError("Plan not found");
  }

  // Check if the user is the admin of the plan
  if (plan.plan_admin.toString() !== user) {
    throw new ForbiddenError("Only the admin of the plan can update it");
  }

  return plan;
};

const referalCodeFunc = async () => {
  return crypto.randomInt(100000, 999999);
};
