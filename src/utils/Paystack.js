import axios from "axios";

export const paystackCreatePlan = async ({
  name,
  interval,
  amount,
  description,
}) => {
  const data = {
    name: name,
    interval: interval,
    amount: amount * 100,
    description: description,
  };

  try {
    const res = await axios.post("https://api.paystack.co/plan", data, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    });
    return res.data.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    throw error; // Re-throw the error if needed for further handling
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/customer",
      customerData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error(
      "Error creating customer:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const SubscribeUserToPlan = async ({
  email,
  customerId,
  planCode,
  amount,
}) => {
  try {
    const paymentData = {
      email: email,
      plan: planCode,
      amount: amount * 100, // Ensure amount is in kobo (100 kobo = 1 naira)
      payment_method: "card", // You can adjust this if you're allowing other payment methods
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    // // Log and return the response data (payment details)
    // console.log("Payment Initialization Response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error(
      "Error initializing payment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const verifyTransaction = async (reference) => {
  const VERIFY_TRANSACTION_URL = "https://api.paystack.co/transaction/verify/";
  try {
    const response = await axios.get(`${VERIFY_TRANSACTION_URL}${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
      },
    });

    const data = response.data.data;

    return data;
  } catch (error) {
    console.error(`Error verifying transaction ${reference}:`, error.message);
    return null;
  }
};

export const PayupdatePlan = async (planId, updateData) => {
  console.log(planId)
  try {
    const response = await axios.put(
      `https://api.paystack.co/plan/${planId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Plan updated successfully:", response.data);
    // return response.data.data;
  } catch (error) {
    console.error(
      "Error updating plan:",
      error.response ? error.response.data : error.message
    );
  }
};
