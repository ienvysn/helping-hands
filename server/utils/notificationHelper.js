const Notification = require("../models/Notification");


const createNotification = async (userId, type, title, message) => {
  try {
    const notification = await Notification.create({
      userId,
      notificationType: type,
      title,
      message,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);

    return null;
  }
};

module.exports = { createNotification };
