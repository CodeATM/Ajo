import mongoose from "mongoose";
import validator from "validator";

const planSchema = new mongoose.Schema(
  {
    plan_name: {
      type: String,
      required: [true, "Plan must have a name"],
    },
    plan_type: {
      type: String,
      required: [true, "You have to specify a plan type"],
      enum: ["individual", "group"],
    },
    pay_planid: {
      type: String,
      unique: true,
      required: true,
    },
    referalCode: {
      type: String,
      unique: true,
    },
    referralCodeExpires: {
      type: Date,
    },
    description: {
      type: String,
    },
    amount: {
      required: true,
      type: Number,
      default: 0.0,
    },
    noOfLinkedAcct: Number,
    plan_member: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    plan_StartDate: {
      type: Date,
      default: Date.now(),
    },
    plan_EndDate: {
      type: Date,
    },
    plan_interval: {
      type: String,
      required: true,
      enum: ["hourly", "daily", "weekly", "monthly", "yearly"],
    },
    plan_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    total_plan_amount: {
      type: Number,
      default: 0.0,
    },
    isPlanActive: {
      type: Boolean,
      default: true,
    },
    // notification: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Notification",
    // },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
