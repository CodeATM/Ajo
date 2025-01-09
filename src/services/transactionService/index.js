import Transaction from "../../modules/v1/models/transactionModel/index.js";
import Plan from "../../modules/v1/models/planModel/index.js";
import User from "../../modules/v1/models/userModel/index.js";
import { NotFoundError } from "../../middlewares/error.middleware.js";

export const getTransactionsByUserService = async (userId) => {
  const isUserValid = await User.findById(userId);
  if (!isUserValid) {
    throw new NotFoundError("User with this Id not Found");
  }
  const transactions = await Transaction.find({ userId });
  return transactions;
};

export const getTransactionsByPlanServices = async (planId) => {
  const isIdValid = await Plan.findById(planId);
  if (!isIdValid) {
    throw new NotFoundError("Plan with this Id now found.");
  }
  const transactions = await Transaction.find({ planId });
  return transactions;
};

export const getAllTransactionServices = async () => {
  const transactions = await Transaction.find();
  return transactions;
};

export const getSingleTransactionService = async (id) => {
  const transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new NotFoundError("Transaction with this Id not found.");
  }
  return transaction;
};

export const searchTransactionService = async (tra_ref) => {
  const transaction = await Transaction.findOne({ tra_ref });
  if (!transaction) {
    throw new NotFoundError("transaction with this refrence not found.");
  }
  return transaction;
};
