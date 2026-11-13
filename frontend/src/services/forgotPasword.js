import api from "../utils/api";

// Request password reset email
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email: email.trim(),
  });

  return response.data;
};
