import mongoose from "mongoose";
import validator from "validator";

const accountSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  accountType: {
    type: String,
    enum: ["Savings", "Current"],
    default: "Savings",
  },
  accountStatus: {
    type: String,
    enum: ["Active", "Dormant", "Closed"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model("Account", accountSchema);
