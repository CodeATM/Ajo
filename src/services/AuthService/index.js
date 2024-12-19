import { BadRequestError } from "../../middlewares/error.middleware.js";
import User from "../../modules/v1/models/userModel/index.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

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

  const verificationToken = await createVerificationTokenFunc(UserIdentity);

  return { verificationToken };
};

const hashpasswordFunc = async (password) => {
  const hash = await bcrypt.hash(password, 12);
  return hash;
};

const createVerificationTokenFunc = async (UserIdentity) => {
  const token = await Jwt.sign(
    UserIdentity,
    process.env.VERIFICATION_TOKEN_SECRET,
    { expiresIn: process.env.VERIFICATION_TOKEN_EXP }
  );
  return token;
};

export const verifyTokenFunc = async (token) => {
  const data = await Jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
  return data;
};
// login
// verify password
// hash password
// generate jwt
