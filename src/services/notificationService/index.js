import {
  BadRequestError,
  NotFoundError,
} from "../../middlewares/error.middleware.js";
import Notification from "../../modules/v1/models/notificationModel/index.js";
import Plan from "../../modules/v1/models/planModel/index.js";
import { UserExistById } from "../userService/index.js";

export const createNotification = async ({
  notificationType,
  recieverId,
  planId,
  message,
  notificationCategory,
  associatedLink,
}) => {
  try {
    const res = await Notification.create({
      notificationType,
      recieverId,
      planId,
      message,
      notificationCategory,
      associatedLink,
    });
    console.log(res);
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Error creating a Notification.");
  }
};

export const getOneNotificationService = async (notificationId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new NotFoundError("Notification not found.");
  }
  return notification;
};

export const getUserNotificationsService = async (userId) => {
  const userPlans = await Plan.find({ plan_member: userId }).select("_id");
  const planIds = userPlans.map((plan) => plan._id);
  const userNotifications = await Notification.find({
    recieverId: userId,
  });

  const planNotifications = await Notification.find({
    planId: { $in: planIds },
  });
  const allNotifications = [...userNotifications, ...planNotifications];

  allNotifications.sort((a, b) => b.createdAt - a.createdAt);

  return allNotifications;
};
