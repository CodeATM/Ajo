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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  balance: {
    type: Number,
    default: 0.0,
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
