import { NotFoundError } from "../../../middlewares/error.middleware.js";
import {
  deleteOneUser,
  getOneUser,
  getUserService,
  UpdateUserDetails,
  UserExist,
  UserExistById,
} from "../../../services/userService/index.js";
import { successResponse } from "../../../utils/response.js";

export const updateUser = async (req, res, next) => {
  try {
    const { updateData } = req.body;
    const { userId } = req.params;
    const userExist = await UserExistById(userId);
    if (!userExist) {
      throw new NotFoundError("User not found");
    }
    const data = await UpdateUserDetails({ userId, updateData });

    await successResponse(res, 200, "User updated succesfully", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const data = await getUserService();
    await successResponse(res, 200, "User fetched successfully", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const oneUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userExist = await UserExistById(userId);
    if (!userExist) {
      throw new NotFoundError("User not found");
    }
    const user = await getOneUser(userId);
    await successResponse(res, 200, "User fetched successfully", user);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userExist = await UserExistById(userId);
    if (!userExist) {
      throw new NotFoundError("User not found");
    }
    await deleteOneUser(userId);
    await successResponse(res, 200, "User deleted successfully", user);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
