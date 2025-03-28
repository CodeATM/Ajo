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
import { createNotification } from "../notificationService/index.js";
import { paystackCreatePlan, PayupdatePlan } from "../../utils/Paystack.js";

export const createPlanService = async ({
  duration,
  amount,
  interval,
  name,
  planType,
  description,
  userId,
}) => {
  // Validate required parameters
  if (
    !duration ||
    !amount ||
    !interval ||
    !name ||
    !planType ||
    !description ||
    !userId
  ) {
    throw new BadRequestError("Make sure your parameters are complete.");
  }

  // Create a plan on Flutterwave
  const plan = await paystackCreatePlan({
    name,
    interval,
    amount,
    description,
  });

  if (!plan) {
    throw new Error("Failed to create a plan on Flutterwave.");
  }

  // Check if user exists
  const user = await UserExistById(userId);
  if (!user) {
    throw new NotFoundError("User with this ID not found.");
  }

  // Generate a referral code
  const { expireTime, referralCode } = await referalCodeFunc(interval);

  // Adjust expiration date logic based on plan type
  const planExpireDate = await setPlanExpireDate({
    currentExpireDate: null,
    interval: interval,
    duration: duration,
  });

  // Create the new plan in the database
  const newPlan = await Plan.create({
    plan_name: plan.name,
    plan_type: planType,
    pay_planid: plan.plan_code,
    referalCode: referralCode,
    referralCodeExpires: expireTime,
    description: description,
    amount: amount,
    plan_interval: plan.interval,
    plan_admin: userId,
    plan_EndDate: planExpireDate,
  });

  // Create a notification for the user
  await createNotification({
    notificationType: "PLAN CREATED SUCCESSFULLY",
    recieverId: newPlan.plan_admin,
    message: `Hello ${user.firstname}, you have successfully created a plan. ${
      planType === "individual"
        ? "Make your first payment to activate this plan."
        : ""
    } We look forward to helping you achieve your savings goals in the future.`,
    notificationCategory: "user",
    associatedLink: "",
  });

  return newPlan;
};

export const updatePlan = async ({ name, planId, user, description }) => {
  if (!name && !description) {
    throw new BadRequestError(
      "At least one field (name or description) must be provided to update"
    );
  }
  const plan = await planValidations({ planId, user });

  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;

  const externalUpdate = await PayupdatePlan(plan.pay_planid, updateData);

  if (externalUpdate.status !== true) {
    throw new BadRequestError("Failed to update plan on Paystack");
  }

  const updateFields = {};
  if (name) updateFields.plan_name = name;
  if (description) updateFields.description = description;

  const updatedPlan = await Plan.findByIdAndUpdate(planId, updateFields, {
    new: true,
  });

  if (!updatedPlan) {
    throw new BadRequestError("Failed to update plan in local database");
  }

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

export const getUserPlansService = async (userId) => {
  const userPlans = await Plan.find({
    $or: [{ plan_admin: userId }, { "plan_member.userId": userId }],
  });

  if (!userPlans || userPlans.length === 0) {
    throw new NotFoundError("This user has no plan.");
  }

  return userPlans;
};

// internal functions used in this file ==============================
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

const referalCodeFunc = async (interval) => {
  let referralCode;
  let isDuplicate = true;

  // Loop until a unique referral code is generated
  while (isDuplicate) {
    referralCode = crypto.randomInt(100000, 999999);

    // Query the database to check if the code already exists
    const existingCode = await Plan.findOne({ referalCode: referralCode });
    if (!existingCode) {
      isDuplicate = false; // Code is unique
    }
  }

  const currentDate = new Date();
  let expireTime;

  if (interval === "monthly") {
    expireTime = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth() + 1,
        currentDate.getUTCDate(),
        0,
        0,
        0
      )
    );
  } else if (interval === "weekly") {
    expireTime = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate() + 7,
        0,
        0,
        0
      )
    );
  } else if (interval === "biannual") {
    expireTime = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth() + 6,
        currentDate.getUTCDate(),
        0,
        0,
        0
      )
    );
  }

  return { referralCode, expireTime };
};

const setPlanExpireDate = async ({ currentExpireDate, interval, duration }) => {
  let expireDate = (await currentExpireDate)
    ? new Date(currentExpireDate)
    : new Date();

  // Use duration to calculate expiration
  if (interval === "monthly") {
    expireDate = new Date(
      Date.UTC(
        expireDate.getUTCFullYear(),
        expireDate.getUTCMonth() + duration, // Multiply by duration for months
        expireDate.getUTCDate(),
        0,
        0,
        0
      )
    );
  } else if (interval === "weekly") {
    expireDate = new Date(
      expireDate.getTime() + duration * 7 * 24 * 60 * 60 * 1000 // Multiply by duration for weeks
    );
  } else if (interval === "biannual") {
    expireDate = new Date(
      Date.UTC(
        expireDate.getUTCFullYear(),
        expireDate.getUTCMonth() + duration * 6, // Multiply by duration for biannual
        expireDate.getUTCDate(),
        0,
        0,
        0
      )
    );
  } else {
    throw new Error("Invalid interval type provided.");
  }
  console.log(expireDate);

  return expireDate;
};
