import User from "../../modules/v1/models/userModel/index.js";

export const UserExist = async ({ identifier }) => {
  const IsTrue = await User.findOne({ email: identifier });
  return IsTrue;
};

export const create = async ({ email, password, phonenumber }) => {
  const data = await User.create({
    email,
    password,
    phonenumber,
    isVerified: true,
  });
  return data;
};
