import { BadRequestError } from "../../../middlewares/error.middleware.js";
import { createAccount } from "../../../services/accountService/index.js";
import {
  changePasswordService,
  loginService,
  refreshService,
  registerService,
  requestOTP,
  resetPasswordService,
  verifyTokenFunc,
  verifyUserService,
} from "../../../services/AuthService/index.js";
import { create, UserExist } from "../../../services/userService/index.js";
import { successResponse } from "../../../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const { firstname, lastname, password, email, phonenumber } = req.body;

    const registerData = {
      firstname,
      lastname,
      password,
      email,
      phonenumber,
    };

    const data = await registerService(registerData);

    return successResponse(res, 200, "Activation code sent to your mail", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const activateAccount = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      throw new BadRequestError("Activation Token missing.");
    }

    const data = await verifyUserService(token);
    return successResponse(res, 200, "Verification Successful", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required for login.");
    }
    const data = await loginService({ email, password });

    await successResponse(res, 200, "User login successful", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new BadRequestError("Missing refresh Token");
    }
    const newAccessToken = await refreshService(refreshToken);
    return successResponse(res, 200, "Refrech Access Token Successfully.", {
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { userId, newPassword, oldPassword } = req.body;

    const data = await changePasswordService({
      userId,
      oldPassword,
      newPassword,
    });

    await successResponse(res, 200, "Password change successfully", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Input your email to ge verification code.");
    }

    await requestOTP({ email });

    await successResponse(res, 200, "6 digit otp sent to mail successfully");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const newPassword = req.body.new_password;
    const otp = req.body.otp;

    if (!otp) throw new BadRequestError("OTP Code Cannot Be Empty.");
    if (!newPassword) throw new BadRequestError("Password Cannot Be Empty.");

    const userId = await resetPasswordService({ newPassword, otp });
    // await NotificationService.notifyPasswordReset(userId);
    return apiResponse.successResponse(
      res,
      200,
      "Password reset Successfully."
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};
