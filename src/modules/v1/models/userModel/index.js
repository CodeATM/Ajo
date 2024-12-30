import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    phonenumber: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isMobilePhone, "Invalid phone number format"],
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
    },
    occupation: {
      type: String,
    },
    nextOfKin: {
      name: { type: String },
      relationship: { type: String },
      phone: {
        type: String,
        validate: [validator.isMobilePhone, "Invalid phone number format"],
      },
      address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
      },
    },
    profileImage: {
      type: String, // URL to the image
    },
    kycStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    savingsBalance: {
      type: Number,
      default: 0.0,
    },
    transactionHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
  },
  { timestamps: true }
);

// 50 cent

export default mongoose.model("User", userSchema);
