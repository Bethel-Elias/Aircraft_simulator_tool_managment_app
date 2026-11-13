import api from "../utils/api";

// Get the currently authenticated user's profile
export const getProfile = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};
