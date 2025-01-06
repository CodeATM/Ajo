import mongoose from "mongoose";

const notificiationtSchema = new mongoose.Schema(
  {
    notificationType: {
      type: String,
      required: true,
      enum: [
        "WELCOME TO AJO",
        "TRANSACTION SUCCESSFUL",
        "WITHDRAWAL SUCCESSFUL",
        "WITHDRAWAL FAILED",
        "PASSWORD UPDATE SUCCESFUL",
        "TRANSACTION FAILED",
        "USER JOINED A PLAN",
        "PLAN CREATED SUCCESSFULLY",
        "SECURITY UPDATE",
      ],
    },
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    message: {
      type: String,
      required: true,
    },
    notificationCategory: {
      type: String,
      required: true,
      enum: ["user", "plan"],
    },
    associatedLink: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificiationtSchema);
