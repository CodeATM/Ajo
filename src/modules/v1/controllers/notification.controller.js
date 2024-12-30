import { getUserNotificationsService, getOneNotificationService } from "../../../services/notificationService";
import { successResponse } from "../../../utils/response";

export const getUserNOtification = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await getUserNotificationsService(userId);

    await successResponse(res, 200, "User Notifications", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getOneNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const data = await getOneNotificationService(notificationId);

    await successResponse(res, 200, "This is the notification", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};



