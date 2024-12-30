import User from "../../modules/v1/models/userModel/index.js";

export const UserExist = async ({ identifier }) => {
  return await User.findOne({ email: identifier });
};
export const UserExistById = async (id) => {
  console.log(id);
  return await User.findById(id);
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

export const UpdateUserDetails = async ({ userId, updateData }) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  const user = updatedUser.id;

  return { user };
};

export const getUserService = async () => {
  const data = await User.find().select("email isActive isVerified kycStatus");

  return { data };
};
export const getOneUser = async (id) => {
  const data = await User.findById(id);

  return { data };
};

export const deleteOneUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  return {
    user,
  };
};
