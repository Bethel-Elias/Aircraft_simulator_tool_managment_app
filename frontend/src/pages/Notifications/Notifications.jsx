import React, { useEffect, useState } from "react";
import api from "../../services/api";
import styles from "./Notification.module.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        // const response = await api.get("/notifications?page=${page}&limit=20");
        const response = await api.get(`/notifications?page=${page}&limit=20`);
        if (!cancelled && response.data.success) {
          setNotifications(response.data.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to load notifications."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [page]);

  // async function markAsRead(id) {
  //   try {
  //     await api.patch(`/notifications/${id}/read`);

  //     setNotifications((previous) =>
  //       previous.map((item) =>
  //         item.id === id ? { ...item, is_read: 1 } : item
  //       )
  //     );
  //   } catch {
  //     setError("Could not mark notification as read.");
  //   }
  // }
  async function markAsRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, is_read: 1 } : item
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError(
        err.response?.data?.message || "Could not mark notification as read."
      );
    }
  }

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <main>
      <h1>Notifications</h1>
      <p>View your simulator workshop alerts and updates.</p>

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        notifications.map((notification) => (
          // <article
          //   key={notification.id}
          //   style={{
          //     padding: "16px",
          //     marginBottom: "12px",
          //     border: "1px solid #e5e7eb",
          //     borderRadius: "8px",
          //     background: notification.is_read ? "#ffffff" : "#f0fdf4",
          //   }}
          // >
          //   <h3>{notification.title}</h3>
          //   <p>{notification.message}</p>
          //   <small>{new Date(notification.created_at).toLocaleString()}</small>

          //   {!notification.is_read && (
          //     <button
          //       type="button"
          //       onClick={() => markAsRead(notification.id)}
          //       style={{ display: "block", marginTop: "10px" }}
          //     >
          //       Mark as read
          //     </button>
          //   )}
          // </article>
          <article
            key={notification.id}
            onClick={() => markAsRead(notification.id)}
            style={{
              padding: "16px",
              marginBottom: "12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: notification.is_read ? "#ffffff" : "#f0fdf4",
              cursor: notification.is_read ? "default" : "pointer",
            }}
          >
            <h3>{notification.title}</h3>

            <p>{notification.message}</p>

            <small>{new Date(notification.created_at).toLocaleString()}</small>

            {!notification.is_read && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  markAsRead(notification.id);
                }}
                style={{ display: "block", marginTop: "10px" }}
              >
                Mark as read
              </button>
            )}
          </article>
        ))
      )}
      <div className={styles.pagination}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((current) => current - 1)}
        >
          Previous
        </button>

        <span>
          Page {pagination.page} of {Math.max(1, pagination.totalPages)}
        </span>

        <button
          type="button"
          disabled={
            pagination.totalPages === 0 || page >= pagination.totalPages
          }
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>
    </main>
  );
}
