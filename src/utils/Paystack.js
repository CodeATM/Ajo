import axios from "axios";
import { BadRequestError } from "../middlewares/error.middleware.js";

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
  planCode,
  amount,
}) => {
  try {
    const paymentData = {
      email: email,
      plan: planCode,
      amount: amount * 100, 
      payment_method: "card",
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
  try {
    const response = await axios.put(
      `https://api.paystack.co/plan/${planId}`,
      { ...updateData, update_existing_subscriptions: true },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Plan updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating plan:",
      error.response ? error.response.data : error.message
    );
    throw new BadRequestError("Failed to update plan");
  }
};
