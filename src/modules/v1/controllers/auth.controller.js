import { BadRequestError } from "../../../middlewares/error.middleware.js";
import { createAccount } from "../../../services/accountService/index.js";
import {
  registerService,
  verifyTokenFunc,
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

    const userIdentity = await verifyTokenFunc(token);
    console.log(userIdentity);
    const userExists = await UserExist(userIdentity.email);

    if (userExists) {
      throw new BadRequestError("User already verified.");
    }
    delete userIdentity["iat"];
    delete userIdentity["exp"];
    console.log(userIdentity);

    const newUser = await create({
      email: userIdentity.email,
      password: userIdentity.password,
      phonenumber: userIdentity.phonenumber,
    });
    console.log(newUser);
    const createAcc = await createAccount({
      firstname: userIdentity.firstname,
      lastname: userIdentity.lastname,
      user: newUser._id,
    });
    console.log(createAcc)
  } catch (error) {
    console.log(error);
    next(error);
  }
};  

// login
// logout
// activate user account
//forget password
// refresh token
// change password
// request otp
// reset Password
