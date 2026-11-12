import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";
import styles from "./ResetPassword.module.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing reset link.");
      return;
    }

    if (newPassword.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    if (newPassword.length > 72) {
      setError("Password is too long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h2>Create New Password</h2>

        <p>Enter and confirm your new account password.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="newPassword">New Password</label>

          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={72}
          />

          <label htmlFor="confirmPassword">Confirm New Password</label>

          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={72}
          />

          {message && (
            <p className={styles.success} role="status">
              {message}
            </p>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading || !!message}>
            {loading ? "Updating Password..." : "Reset Password"}
          </button>
        </form>

        <Link to="/login">Back to Login</Link>
      </section>
    </main>
  );
}
