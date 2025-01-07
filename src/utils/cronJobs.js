import cron from "node-cron";
import { verifyTransaction } from "./Paystack.js";
import Transaction from "../modules/v1/models/transactionModel/index.js";

export const runTransactionVerificationJob = () => {
  cron.schedule("*/2 * * * *", async () => {
    console.log("Running automated transaction verification job...");

    try {
      // Fetch all pending transactions
      const pendingTransactions = await Transaction.find({ status: "pending" });
      console.log(`Found ${pendingTransactions.length} pending transactions.`);

      for (const transaction of pendingTransactions) {
        const { reference } = transaction;

        // Call verifyTransaction to check the status of the transaction
        const status = await verifyTransaction(reference);

        console.log(status)

        

        if (status === "success" || status === "failed") {
          // Update transaction status directly using findOneAndUpdate
          const updatedTransaction = await Transaction.findOneAndUpdate(
            { reference: reference }, // Find the transaction by reference
            { 
              status: status.data.status, // Set the new status
              updatedAt: new Date() // Set the updated timestamp
            },
            { new: true } // Optionally return the updated document
          );
          console.log(updatedTransaction)
          console.log(`Transaction ${reference} updated to ${updatedTransaction.status}.`);
        } else {
          console.log(`Transaction ${reference} is still pending.`);
        }
      }
    } catch (error) {
      console.error("Error processing transactions:", error.message);
    }
  });
};
