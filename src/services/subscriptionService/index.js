import { flwActivateSubscription } from "../../utils/flutterwave.js";
import { UserExistById } from "../.././services/userService/index.js";
import User from "../../modules/v1/models/userModel/index.js";
import Plan from "../../modules/v1/models/planModel/index.js";
import { NotFoundError } from "../../middlewares/error.middleware.js";

export const subscribUserService = async ({ planId, userId }) => {
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

  const data = await flwActivateSubscription({ planId, userData, trx_ref });

  return data
};

const generateTransactionRefFunc = async (plan) => {
  const date = date.now();
  const plan_id = plan.flu_planid;

  const ref = `${date}${plan_id}`;
  console.log(ref);
  return ref;
};
