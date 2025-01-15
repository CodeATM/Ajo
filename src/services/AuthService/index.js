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
import { createNotification } from "../notificationService/index.js";
import redisClient from "../../utils/redis/index.js";

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
  const userExists = await UserExist(userIdentity.email);

  if (userExists) {
    throw new BadRequestError("User already verified.");
  }
  delete userIdentity["iat"];
  delete userIdentity["exp"];

  const createAcc = await createAccount({
    firstname: userIdentity.firstname,
    lastname: userIdentity.lastname,
    phonenumber: userIdentity.phonenumber,
    email: userIdentity.email,
  });

  const newUser = await create({
    email: userIdentity.email,
    password: userIdentity.password,
    phonenumber: userIdentity.phonenumber,
    account: createAcc.id,
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

  await createNotification({
    notificationType: "WELCOME TO AJO",
    recieverId: userId,
    message: `Hello ${createAcc.firstname}, welcome to ajo the one place for all savings and finacial related issues`,
    notificationCategory: "user",
    associatedLink: "",
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

  const accessTTL = parseInt(process.env.ACCESS_TTL, 10) * 60;
  const refreshTTL = parseInt(process.env.REFRESH_TTL, 10) * 24 * 3600;

  await redisClient.set(userId, `${accessToken.split(".")[1]}`, accessTTL);
  await redisClient.set(
    `${userId}_refresh`,
    `${refreshToken.split(".")[1]}`,
    refreshTTL
  );
  return { accessToken, refreshToken, userId };
};

export const refreshService = async (refreshToken) => {
  try {
    const user = await verifyTokenFunc(refreshToken);
    const isLoggedIn = await redisClient.get(`${user.userId}_refresh`);
    if (!isLoggedIn || isLoggedIn !== `${refreshToken.split(".")[1]}`) {
      throw new ForbiddenError("The token is invalid or has expired.");
    }
    const newAccessToken = await createJwtTokenFunc({
      UserIdentity: { userId: user.userId },
      expiresIn: process.env.ACCESS_TTL,
    });
    await redisClient.set(
      user.userId,
      `${newAccessToken.split(".")[1]}`,
      parseInt(process.env.ACCESS_TTL, 10) * 60 // TTL in seconds
    );

    return { newAccessToken };
  } catch (error) {
    console.error("Error in refreshService:", error.message);
    throw error;
  }
};

export const changePasswordService = async ({
  userId,
  oldPassword,
  newPassword,
}) => {
  const user = await User.findById(userId).populate("account");
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

  await createNotification({
    notificationType: "WELCOME TO AJO",
    recieverId: userId,
    message: `Hello ${user.account.firstname}, Your password has ben successfully updated. Please make sure to keep it safe from unauthorized parties for maximum security.`,
    notificationCategory: "user",
    associatedLink: "",
  });
};

export const requestOTP = async ({ email }) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new NotFoundError("User with this email not found.");
  }

  // const subject = "Password Reset";
  const otpCode = await OTPFunc();
  // await sendVerificationEmail(email, subject, 'password-reset.html', optCode, {username: user.profile.username});
  await redisClient.set(
    otpCode,
    `${user.id}_OTP`,
    parseInt(process.env.OTP_TTL)
  );
  console.log(otpCode);
};

export const resetPasswordService = async ({ password, otp }) => {
  const isValidOTP = await redisClient.get(otp);

  if (!isValidOTP) throw new BadRequestError("Expired Or Worng OTP Code.");
  const hashedPassword = await hashpasswordFunc(password);

  const data = { password: hashedPassword };
  const userId = isValidOTP.split("_")[0];

  await User.findByIdAndUpdate(userId, {
    password: hashedPassword,
  });
  await redisClient.del(otp);

  return userId;
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
