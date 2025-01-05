import { flwActivateSubscription } from "../../utils/flutterwave.js";
import { UserExistById } from "../.././services/userService/index.js";
import User from "../../modules/v1/models/userModel/index.js";
import Plan from "../../modules/v1/models/planModel/index.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../middlewares/error.middleware.js";

const verifyReferralCode = async (refCode) => {
  const planExist = await Plan.findOne({ referalCode: refCode });

  if (!planExist) {
    throw new NotFoundError("No plan with this referral code");
  }
};

export const subscribUserService = async ({ planId, userId, refCode }) => {
  await verifyReferralCode(refCode);
  const user = await User.findById(userId).populate("account");
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new NotFoundError("Plan not found");
  }
  const trx_ref = await generateTransactionRefFunc(plan);
  const userData = {
    email: user.email,
    phonenumber: user.phonenumber,
    firstname: user.account.firstname,
    lastname: user.account.lastname,
  };

  const fluId = plan.flu_planid;

  const data = await flwActivateSubscription({ fluId, userData, trx_ref });

  return data;
};

const generateTransactionRefFunc = async (plan) => {
  const date = Date.now();
  const plan_id = plan.flu_planid;
  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const ref = `TXN-${date}${plan_id}${randomSuffix}`;
  console.log(ref);
  return ref;
};
