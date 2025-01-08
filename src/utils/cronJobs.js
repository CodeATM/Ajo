import cron from "node-cron";
import { verifyTransaction } from "./Paystack.js";
import Transaction from "../modules/v1/models/transactionModel/index.js";
import Plan from "../modules/v1/models/planModel/index.js";
import User from "../modules/v1/models/userModel/index.js";
import { createNotification } from "../services/notificationService/index.js";

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

        if (status.status === "failed" || status.status === "success") {
          const updatedTransaction = await Transaction.findOneAndUpdate(
            { reference: reference },
            {
              status: status.status,
              updatedAt: new Date(),
            },
            { new: true }
          );
        }

        if (status.status === "success") {
          // Fetch the user
          const user = await User.findById(transaction.userId);

          if (!user) {
            console.log(`User not found.`);
            continue;
          }

          // Fetch the plan
          const plan = await Plan.findById(transaction.planId);

          if (!plan) {
            console.log(`Plan not found.`);
            continue;
          }

          // Check if the user is already a member
          const isMember = plan.plan_member.some(
            (memberId) => memberId.toString() === user._id.toString()
          );

          if (!isMember) {
            // Add the user to the plan
            plan.plan_member.push(user._id);
            plan.total_plan_amount += plan.amount; // Increment total plan amount

            // Save the updated plan
            await plan.save();
            console.log(`User has been added to plan.`);

            // Create a subscription success notification
            await createNotification({
              notificationType: "TRANSACTION SUCCESSFUL",
              planId: transaction.planId,
              message: `Hello, someone successfully subscribed to this plan.`,
              notificationCategory: "plan",
              associatedLink: "",
            });
            console.log(`Notification sent to user.`);
          }
        } else if (status.status === "failed") {
          // Create a transaction failure notification
          await createNotification({
            notificationType: "TRANSACTION FAILED",
            userId: transaction.userId,
            message: `Your transaction for plan ${transaction.planId} has failed. Please try again.`,
            notificationCategory: "user",
            associatedLink: "",
          });
          console.log(`Transaction failure notification sent.`);
        }
      }
    } catch (error) {
      console.error("Error processing transactions:", error.message);
    }
  });
};

export const unsubscribeUsersFromAnExpiredPlan = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running unsubscribeUsersFromAnExpiredPlan at midnight...");
    try {
      // Step 1: Find expired plans
      const expiredPlans = await Plan.find({
        plan_EndDate: { $lte: new Date() },
        isActive: true,
      });

      for (const plan of expiredPlans) {
        // Step 2: Iterate over plan members and unsubscribe them
        for (const member of plan.plan_member) {
          try {
            // Call Paystack or Flutterwave API to unsubscribe the user
            const response = await axios.post(
              `https://api.paystack.co/subscription/${member.subscriptionId}/disable`,
              {},
              {
                headers: {
                  Authorization: "Bearer SECRET_KEY", // Replace with your secret key
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.data.status !== "success") {
              console.error(
                `Failed to unsubscribe user ${member.userId} from plan ${plan._id}`
              );
            } else {
              console.log(
                `Successfully unsubscribed user ${member.userId} from plan ${plan._id}`
              );
            }
          } catch (error) {
            console.error(
              `Error unsubscribing user ${member.userId}:`,
              error.message
            );
          }
        }

        // Step 3: Mark the plan as inactive in the database
        plan.isActive = false;
        await plan.save();
      }

      console.log("Unsubscribed all users from expired plans successfully.");
    } catch (error) {
      console.error(
        "Error in unsubscribing users from expired plans:",
        error.message
      );
    }
  });
};
