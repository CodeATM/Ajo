import { BadRequestError } from "../../../middlewares/error.middleware.js";
import {
  getAllTransactionServices,
  getSingleTransactionService,
  getTransactionsByPlanServices,
  getTransactionsByUserService,
  searchTransactionService,
} from "../../../services/transactionService/index.js";
import { successResponse } from "../../../utils/response.js";

export const getAllTransaction = async (req, res, next) => {
  try {
    const data = await getAllTransactionServices();

    await successResponse(res, 200, "Here are all transaction", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getUserTransaction = async (req, res, next) => {
  try {
    const userId = req.user;
    if (!userId) {
      throw new BadRequestError("No valid user Id");
    }

    const data = await getTransactionsByUserService(userId);
    await successResponse(res, 200, "Here are all user Transaction", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getPlanTransaction = async (req, res, next) => {
  try {
    const { planId } = req.params;
    if (!planId) {
      throw new BadRequestError("Invalid Plan Id");
    }

    const data = await getTransactionsByPlanServices(planId);

    await successResponse(
      res,
      200,
      "Plan Tansaction fetched succesfully",
      data
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const SerachForTransaction = async (req, res, next) => {
  try {
    const { trx_ref } = req.body;
    if (!trx_ref) {
      throw new BadRequestError("Input a transaction refrence");
    }
    const data = await searchTransactionService(trx_ref);
    await successResponse(res, 200, "Transaction Fetched", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getSingleTransaction = async (req, res, next) => {
  try {
    const { tranId } = req.params;
    if (!tranId) {
      throw new BadRequestError("Transaction Id not found");
    }

    const data = await getSingleTransactionService(tranId);

    await successResponse(res, 200, "Transaction fetched Sccessfully", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
