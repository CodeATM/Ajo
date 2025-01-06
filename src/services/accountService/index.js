import { BadRequestError } from "../../middlewares/error.middleware.js";
import Account from "../../modules/v1/models/accountModel/index.js";
import { createCustomer } from "../../utils/Paystack.js";

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

export const createAccount = async ({
  firstname,
  lastname,
  email,
  phonenumber,
}) => {
  try {
    let accountNum;
    let isUnique = false;

    // Keep generating until a unique account number is found
    while (!isUnique) {
      accountNum = generateUniqueAccountNumberFunc();
      isUnique = !(await isAccountNumUniqueFunc(accountNum));
    }
    const customerData = {
      firstname,
      lastname,
      email,
      phonenumber,
    };

    const customer = await createCustomer(customerData);

    // Create the account
    const newAccount = await Account.create({
      firstname,
      lastname,
      accountNumber: accountNum,
      customerCode: customer.customer_code,
      customerId: customer.id,
    });

    return newAccount;
  } catch (error) {
    throw new BadRequestError("Failed to create account.");
  }
};
