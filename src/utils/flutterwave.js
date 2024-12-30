import Flutterwave from "flutterwave-node-v3";
import axios from "axios";

export const flwCreatePlan = async ({ duration, amount, interval, name }) => {
  const flw = new Flutterwave(
    process.env.FLW_PUBLIC_KEY,
    process.env.FLW_SECRET_KEY
  );
  const details = {
    amount: amount,
    name: name,
    interval: interval,
    duration: duration,
    currency: "NGN",
  };
  const response = await flw.PaymentPlan.create(details);
  return response.data;
};

export const flwUpdatePlan = async ({ name, planId }) => {
  const flw = new Flutterwave(
    process.env.FLW_PUBLIC_KEY,
    process.env.FLW_SECRET_KEY
  );

  const response = await flw.PaymentPlan.update({
    id: planId,
    name,
    status: "active",
  });

  return response;
};

export const flwCancelPlan = async (planId) => {
  const flw = new Flutterwave(
    process.env.FLW_PUBLIC_KEY,
    process.env.FLW_SECRET_KEY
  );

  const response = await flw.PaymentPlan.cancel({ id: planId });

  return response;
};

export const flwActivateSubscription = async ({
  planId,
  userData,
  trx_ref,
}) => {
  try {
    const planDetailsUrl = `https://api.flutterwave.com/v3/payment-plans/${planId}`;

    const planDetailsResponse = await axios.get(planDetailsUrl, {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    });

    if (planDetailsResponse.data.status !== "success") {
      throw new Error(
        `Failed to fetch plan details: ${planDetailsResponse.data.message}`
      );
    }

    const { amount, currency, name } = planDetailsResponse.data.data;

    const payload = {
      tx_ref: `subscription_${trx_ref}`,
      amount,
      currency,
      redirect_url: "https://yourwebsite.com/payment-completed",
      payment_plan: planId,
      customer: {
        email: userData.email,
        phonenumber: userData.phonenumber,
        name: `${userData.firstname} ${userData.lastname}`,
      },
    };

    const paymentResponse = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (paymentResponse.data.status === "success") {
      const { link } = paymentResponse.data.data;
      console.log("Payment link generated successfully:", link);
      return link;
    } else {
      throw new Error(
        `Failed to generate payment link: ${paymentResponse.data.message}`
      );
    }
  } catch (error) {
    console.error(
      "Error generating payment link:",
      error.response?.data || error.message
    );
    throw error;
  }
};
