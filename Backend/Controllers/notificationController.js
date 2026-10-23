const notificationModel = require("../Models/notificationModel");


// GET /notifications?page=1&limit=20
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    const offset = (page - 1) * limit;

    // Get total number of notifications
    const total =
      await notificationModel.countNotificationsByUserId(userId);

    // Get notifications for the requested page
    const notifications =
      await notificationModel.findNotificationsByUserId(
        userId,
        limit,
        offset
      );

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications.",
    });
  }
};

// PATCH /notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await notificationModel.markAsRead(id, userId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

// PATCH /notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await notificationModel.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};
