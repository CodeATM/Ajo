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
  const plan = await flwCreatePlan({ duration, amount, interval, name });

  if (!plan) {
    throw new Error("Failed to create a plan on Flutterwave.");
  }

  // Check if user exists
  const user = await UserExistById(userId);
  if (!user) {
    throw new NotFoundError("User with this ID not found.");
  }

  // Generate a referral code
  const { expireTime, referalCode } = await referalCodeFunc({ interval });
  const planExpireDate = await setPlanExpireDate(interval);

  // Create the new plan in the database
  const newPlan = await Plan.create({
    plan_name: plan.name,
    plan_type: planType,
    flu_planid: plan.id,
    referalCode: referalCode,
    referralCodeExpires: expireTime,
    description: description,
    amount: plan.amount,
    plan_span: plan.duration,
    plan_interval: plan.interval,
    plan_token: plan.plan_token,
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

const referalCodeFunc = async (interval) => {
  const referralCode = crypto.randomInt(100000, 999999);
  let expireTime;
  const currentDate = new Date();

  if (interval === "Monthly") {
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
  } else if (interval === "Weekly") {
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
  } else if (interval === "Biannual") {
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
  } else {
    throw new Error("Invalid interval type provided.");
  }

  return { referralCode, expireTime };
};

const setPlanExpireDate = (currentExpireDate, interval, userCount) => {
  let expireDate = currentExpireDate ? new Date(currentExpireDate) : new Date();

  if (userCount === 0) {
    if (interval === "Monthly") {
      expireDate = new Date(
        Date.UTC(
          expireDate.getUTCFullYear(),
          expireDate.getUTCMonth() + 1,
          expireDate.getUTCDate(),
          0,
          0,
          0
        )
      );
    } else if (interval === "Weekly") {
      expireDate = new Date(
        Date.UTC(
          expireDate.getUTCFullYear(),
          expireDate.getUTCMonth(),
          expireDate.getUTCDate() + 7,
          0,
          0,
          0
        )
      );
    } else if (interval === "Biannual") {
      expireDate = new Date(
        Date.UTC(
          expireDate.getUTCFullYear(),
          expireDate.getUTCMonth() + 6,
          expireDate.getUTCDate(),
          0,
          0,
          0
        )
      );
    } else {
      throw new Error("Invalid interval type provided.");
    }
  } else {
    if (interval === "Monthly") {
      expireDate = new Date(
        Date.UTC(
          expireDate.getUTCFullYear(),
          expireDate.getUTCMonth() + userCount,
          expireDate.getUTCDate(),
          0,
          0,
          0
        )
      );
    } else if (interval === "Weekly") {
      expireDate = new Date(
        Date.UTC(
          expireDate.getUTCFullYear(),
          expireDate.getUTCMonth(),
          expireDate.getUTCDate() + userCount * 7,
          0,
          0,
          0
        )
      );
    } else if (interval === "Biannual") {
      expireDate = new Date(
        Date.UTC(
          expireDate.getUTCFullYear(),
          expireDate.getUTCMonth() + userCount * 6,
          expireDate.getUTCDate(),
          0,
          0,
          0
        )
      );
    } else {
      throw new Error("Invalid interval type provided.");
    }
  }

  return expireDate;
};
