import { flwActivateSubscription } from "../../utils/flutterwave.js";
import { UserExistById } from "../.././services/userService/index.js";
import User from "../../modules/v1/models/userModel/index.js";
import Plan from "../../modules/v1/models/planModel/index.js";
import Transaction from "../../modules/v1/models/transactionModel/index.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../middlewares/error.middleware.js";
import { SubscribeUserToPlan } from "../../utils/Paystack.js";

const verifyReferralCode = async (refCode) => {
  const planExist = await Plan.findOne({ referalCode: refCode });
  if (!planExist) {
    throw new NotFoundError("No plan with this referral code");
  }
  const currentDate = new Date();
  const expirationDate = new Date(planExist.expireTime);
  if (currentDate > expirationDate) {
    throw new BadRequestError("Referral code has expired");
  }

  // Optionally, you can return the plan or other details if needed
  return planExist;
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

  const data = await SubscribeUserToPlan({
    planCode: plan.pay_planid,
    customerId: user.account.customerCode,
    email: user.email,
    amount: plan.amount,
  });

  const newTransaction = await Transaction.create({
    reference: data.reference,
    trx_ref,
    status: "pending",
    amountPaid: plan.amount,
    currency: "NGN",
    paymentChannel: "card",
    customer: {
      email: user.email,
      customerCode: user.account.customerCode,
    },
    userId: userId,
    planId: planId,
    isRecurring: true,
    paymentInterval: plan.plan_interval,
  });

  return { data, newTransaction };
};

const generateTransactionRefFunc = async (plan) => {
  const date = Date.now();
  const plan_id = plan.pay_planid;
  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const ref = `TXN-${date}${plan_id}${randomSuffix}`;
  console.log(ref);
  return ref;
};
