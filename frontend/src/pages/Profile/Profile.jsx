
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import styles from "./Profile.module.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        if (!response.data.success) {
          throw new Error("Unable to load your profile.");
        }

        const currentUser = response.data.data;

        if (!cancelled) {
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setError("Your session has expired. Please log in again.");
          } else {
            setError(
              err.response?.data?.message ||
                "Failed to load your profile. Please try again."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <p className={styles.message}>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.pageHeader}>
        <h1>My Profile</h1>
        <p>View your personal and account information.</p>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className={styles.profileHeading}>
            <h2>{user?.full_name || "Not available"}</h2>
            <span className={styles.roleBadge}>
              {user?.role?.replace(/_/g, " ") || "User"}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <h3 className={styles.sectionTitle}>Personal Information</h3>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Full Name</span>
            <p>{user?.full_name || "Not available"}</p>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Employee ID</span>
            <p>{user?.employee_id || "Not available"}</p>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email Address</span>
            <p>{user?.email || "Not available"}</p>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Account Role</span>
            <p>{user?.role?.replace(/_/g, " ") || "Not available"}</p>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Account Status</span>
            <p>
              <span
                className={
                  user?.status === "ACTIVE"
                    ? styles.activeStatus
                    : styles.inactiveStatus
                }
              >
                {user?.status || "Not available"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}