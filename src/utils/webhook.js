import crypto from "crypto";
import Plan from "../modules/v1/models/planModel/index.js";
import User from "../modules/v1/models/userModel/index.js";

const handleChargeSuccess = async (transactionData) => {
  const customer = transactionData.customer.customer_code;
  const authorization_code = transactionData.authorization.authorization_code;

  const user = await User.findOne({ where: { customerCode: customer } });
  if (user) {
    user.authorization = authorization_code;
    user.paidRegFee = true;
    await user.save();

    await makeSubscription(
      user.customerCode,
      user.userPlan,
      user.authorization,
      user.email
    );

    console.log("Successful transaction:", transactionData);
  }
};

const handleTransferSuccess = async (transactionData) => {
  console.log("Transfer success:", transactionData);
  // Add your logic for handling successful transfers
};

const handleTransferFail = async (transactionData) => {
  console.log("Transfer failed:", transactionData);
  // Add your logic for handling failed transfers
};

const handleWebhook = async (req, res) => {
  const hash = req.headers["x-paystack-signature"];
  const body = JSON.stringify(req.body);
  const expectedHash = crypto
    .createHmac("sha512", process.env.paystack_secret_key)
    .update(body)
    .digest("hex");

  if (hash === expectedHash) {
    const event = req.body.event;
    const transactionData = req.body.data;

    try {
      switch (event) {
        case "charge.success":
          await handleChargeSuccess(transactionData);
          break;
        case "transfer.success":
          await handleTransferSuccess(transactionData);
          break;
        case "transfer.failed":
          await handleTransferFail(transactionData);
          break;
        default:
          console.log("Unhandled event:", event);
      }
      res.status(200).end();
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).end();
    }
  } else {
    console.error("Webhook signature verification failed");
    res.status(400).end();
  }
};

export default handleWebhook;
