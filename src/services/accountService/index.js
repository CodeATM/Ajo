import { BadRequestError } from "../../middlewares/error.middleware.js";
import  Account from "../../modules/v1/models/accountModel/index.js";

const generateUniqueAccountNumberFunc = () => {
  const prefix = "133";
  const remainingDigits = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0");
  return prefix + remainingDigits;
};

const isAccountNumUniqueFunc = async (accountNum) => {
  const account = await Account.findOne({ accountNumber: accountNum });
  return !!account;
};

export const createAccount = async ({ firstname, lastname, user }) => {
  let accountNum;
  let isUnique = false;

  // Keep generating until a unique account number is found
  while (!isUnique) {
    accountNum = generateUniqueAccountNumberFunc();
    isUnique = !(await isAccountNumUniqueFunc(accountNum));
  }

  // Create the account
  const newAccount = new Account({
    firstname,
    lastname,
    user,
    accountNumber: accountNum,
  });

  try {
    await newAccount.save();
    return newAccount;
  } catch (error) {
    throw new BadRequestError("Failed to create account.");
  }
};
