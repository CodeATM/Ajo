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
  dateOfBirth: {
    type: String,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Account", accountSchema);
