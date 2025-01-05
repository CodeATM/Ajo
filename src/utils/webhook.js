import Plan from "../modules/v1/models/planModel/index.js";
import User from "../modules/v1/models/userModel/index.js";

const handleWebhook = async (req, res) => {
  const hash = req.headers["x-paystack-signature"];
  const body = JSON.stringify(req.body);
  const expectedHash = crypto
    .createHmac("sha512", process.env.paystack_secret_key)
    .update(body)
    .digest("hex");

  if (hash === expectedHash) {
    const event = req.body.event;
    if (event === "charge.success") {
      const transactionData = req.body.data;
      const customer = transactionData.customer.customer_code;
      const authorization_code =
        transactionData.authorization.authorization_code;

      const user = await User.findOne({ where: { customerCode: customer } });
      if (user) {
        user.authorization = authorization_code;
        user.paidRegFee = true;
        await user.save();
      }
      await makeSubscription(
        user.customerCode,
        user.userPlan,
        user.authorization,
        user.email
      );

      console.log("Successful transaction:", transactionData);
    }
    res.status(200).end();
  } else {
    console.error("Webhook signature verification failed");
    res.status(400).end();
  }
};

const chargeSucccessWebhook = async () => {};

const transferSuccessWebhook = async () => {};

const transferFailWebhook = async () => {};


