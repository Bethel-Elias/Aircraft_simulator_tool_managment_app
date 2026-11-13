import api from "../utils/api";

// Get notifications with pagination
export const getNotifications = async (page = 1, limit = 20) => {
  const response = await api.get(`/notifications?page=${page}&limit=${limit}`);

  return response.data;
};

// Mark a notification as read
export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);

  return response.data;
};
