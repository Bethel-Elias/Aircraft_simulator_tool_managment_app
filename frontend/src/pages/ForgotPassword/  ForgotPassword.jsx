
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ForgotPassword.module.css";
import { forgotPassword } from "../../services/forgotPasword";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const data = await forgotPassword(email);

      setMessage(data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h2>Forgot Password?</h2>

        <p>Enter your registered email address to request a password reset.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {message && <p className={styles.success}>{message}</p>}

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Request Password Reset"}
          </button>
        </form>

        <Link to="/login">Back to Login</Link>
      </section>
    </main>
  );
}
