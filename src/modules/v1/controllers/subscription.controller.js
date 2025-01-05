import { BadRequestError } from "../../../middlewares/error.middleware.js";
import { subscribUserService } from "../../../services/subscriptionService/index.js";
import { successResponse } from "../../../utils/response.js";

export const subscribeUser = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const userId = req.user;
    const { refCode } = req.body;

    if (!planId && !userId) {
      throw new BadRequestError("Plan Id or user Id missing.");
    }

    const data = await subscribUserService({ planId, userId, refCode });

    await successResponse(res, 200, "User subscription initiated", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
