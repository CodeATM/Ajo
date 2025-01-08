import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // Fields from Payment Gateway response
    transactionId: {
      type: String,
      unique: true,
    },
    reference: { type: String, required: true, unique: true },
    trx_ref: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      required: true,
    },
    amountPaid: { type: Number, required: true },
    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN", "USD", "EUR", "GBP"],
    },
    paymentChannel: {
      type: String,
      enum: ["card", "bank", "ussd", "qr", "mobile_money"],
      required: true,
    },
    paidAt: { type: Date },
    fees: { type: Number },
    authorization: {
      authorizationCode: { type: String },
      cardType: { type: String },
      last4: { type: String },
      expMonth: { type: String },
      expYear: { type: String },
      bank: { type: String },
      reusable: { type: Boolean },
      signature: { type: String },
    },
    customer: {
      email: { type: String, required: true },
      customerCode: { type: String, required: true },
      phone: { type: String },
      firstName: { type: String },
      lastName: { type: String },
    },

    // Locally generated data
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    endDate: { type: Date },
    isRecurring: { type: Boolean, default: true },
    paymentInterval: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
