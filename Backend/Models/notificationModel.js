const { query } = require("../config/db.config");

// Get the latest 50 notifications for a user
exports.findNotificationsByUserId = async (userId, limit, offset) => {
  return await query(
    `SELECT id, title, message, type, is_read, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
};

// Get total number of notifications for a user
exports.countNotificationsByUserId = async (userId) => {
  const rows = await query(
    `SELECT COUNT(*) AS total
     FROM notifications
     WHERE user_id = ?`,
    [userId]
  );

  return Number(rows[0].total);
}

// Mark one notification as read
exports.markAsRead = async (notificationId, userId) => {
  return await query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
};

// Mark all unread notifications as read
exports.markAllAsRead = async (userId) => {
  return await query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE user_id = ? AND is_read = FALSE`,
    [userId]
  );
};
