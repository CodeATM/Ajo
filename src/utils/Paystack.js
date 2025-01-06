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
  customerId,
  planCode,
  amount,
  email,
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

    // Log and return the response data (payment details)
    console.log("Payment Initialization Response:", response.data);
    return response.data.data; // Return the payment initialization response
  } catch (error) {
    console.error(
      "Error initializing payment:",
      error.response?.data || error.message
    );
    throw error;
  }
};
