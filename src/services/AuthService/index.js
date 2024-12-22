import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../middlewares/error.middleware.js";
import User from "../../modules/v1/models/userModel/index.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import crypto from "crypto";
import { createAccount } from "../accountService/index.js";
import { create, UserExist } from "../userService/index.js";

// register
export const registerService = async (registerData) => {
  const { email, phonenumber, password, firstname, lastname } = registerData;
  const userExists = await User.findOne({
    $or: [{ email }, { phonenumber }],
  });

  if (userExists) {
    throw new BadRequestError(
      "User with this phonenumber and password already exist."
    );
  }

  const hashpassword = await hashpasswordFunc(password);

  const UserIdentity = {
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: hashpassword,
    phonenumber,
  };

  const verificationToken = await createJwtTokenFunc({
    UserIdentity,
    expiresIn: process.env.VERIFICATION_TOKEN_EXP,
  });

  return { verificationToken };
};

export const verifyUserService = async (token) => {
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
  const createAcc = await createAccount({
    firstname: userIdentity.firstname,
    lastname: userIdentity.lastname,
    user: newUser._id,
  });

  const userId = newUser.id;
  const accessToken = await createJwtTokenFunc({
    UserIdentity: { userId },
    expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP,
  });

  const refreshToken = await createJwtTokenFunc({
    UserIdentity: { userId },
    expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP,
  });
  return { accessToken, refreshToken, userId };
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new NotFoundError("Email and password is incorrect.");
  }

  const isPasswordCorrect = await comparePasswordFunc(password, user.password);
  if (!isPasswordCorrect) {
    throw new UnauthorizedError("Password are incorrect.");
  }
  const userId = user.id;
  const accessToken = await createJwtTokenFunc({
    UserIdentity: { userId },
    expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP,
  });

  const refreshToken = await createJwtTokenFunc({
    UserIdentity: { userId },
    expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP,
  });
  return { accessToken, refreshToken, userId };
};

export const changePasswordService = async ({
  userId,
  oldPassword,
  newPassword,
}) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User with this id not found.");
  }

  const isPasswordCorrect = await comparePasswordFunc(
    oldPassword,
    user.password
  );
  if (!isPasswordCorrect) {
    throw new UnauthorizedError(
      "Your password and old password does not match"
    );
  }
  const hashpassword = await hashpasswordFunc(newPassword);
  await User.findByIdAndUpdate(userId, {
    password: hashpassword,
  });
};

export const requestOTP = ({ email }) => {
  // create the OTP
};

const hashpasswordFunc = async (password) => {
  const hash = await bcrypt.hash(password, 12);
  return hash;
};

const createJwtTokenFunc = async ({ UserIdentity, expiresIn }) => {
  if (!expiresIn) {
    throw new Error('Token expiration time ("expiresIn") is not defined.');
  }
  return Jwt.sign(UserIdentity, process.env.VERIFICATION_TOKEN_SECRET, {
    expiresIn,
  });
};

export const verifyTokenFunc = async (token) => {
  const data = await Jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
  return data;
};

const comparePasswordFunc = async (plaintextPassword, hashedPassword) => {
  return await bcrypt.compare(plaintextPassword, hashedPassword);
};

const OTPFunc = async () => {
  return crypto.randomInt(100000, 999999);
};

// login
// verify password
// hash password
// generate jwt
