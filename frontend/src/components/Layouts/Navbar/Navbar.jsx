import api from "../../../services/api";
import React, { useState, useEffect, useRef} from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Menu,
  Bell,
  UserCircle,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCheck,
} from "lucide-react";

import styles from "./Navbar.module.css";

export default function Navbar({ onMenuClick, onLogout, sidebarOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationError, setNotificationError] = useState("");
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });



  const navigate = useNavigate();


  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  function toggleNotifications() {
    setShowNotifications((previous) => !previous);
    setShowProfile(false);
  }

  function toggleProfile() {
    setShowProfile((previous) => !previous);
    setShowNotifications(false);
  }

  
  async function markAllAsRead() {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          unread: false,
        }))
      );
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      setNotificationError("Could not mark notifications as read.");
    }
  }

 function handleLogout() {
   localStorage.removeItem("token");
   localStorage.removeItem("user");
   navigate("/login", { replace: true });
 }



useEffect(() => {
  let cancelled = false;

  // 1. Close dropdowns when clicking outside
  function handleOutsideClick(event) {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowNotifications(false);
    }

    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setShowProfile(false);
    }
  }

  document.addEventListener("mousedown", handleOutsideClick);

  // 2. Fetch the logged-in user's information
  async function fetchCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await api.get("/auth/me");

      if (!cancelled && response.data.success) {
        setUser(response.data.data);

        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);

      if (!cancelled && error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }

  // 3. Fetch notifications
  async function fetchNotifications() {
    const token = localStorage.getItem("token");

    if (!token) {
      setNotifications([]);
      setNotificationsLoading(false);
      return;
    }

    try {
      const response = await api.get("/notifications");

      if (!cancelled && response.data.success) {
        const items = response.data.data.map((item) => ({
          ...item,
          unread: !item.is_read,
          time: new Date(item.created_at).toLocaleString(),
        }));

        setNotifications(items);
        setNotificationError("");
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);

      if (!cancelled) {
        setNotificationError("Unable to load notifications.");
      }
    } finally {
      if (!cancelled) {
        setNotificationsLoading(false);
      }
    }
  }

  // Run both requests
  fetchCurrentUser();
  fetchNotifications();

  // 4. Cleanup when Navbar unmounts
  return () => {
    cancelled = true;
    document.removeEventListener("mousedown", handleOutsideClick);
  };
}, []);

  return (
    <header className={styles.header}>
      {/* MENU */}
      <button
        type="button"
        className={styles.menuButton}
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
        onClick={onMenuClick}
      >
        <Menu size={23} />
      </button>

      <div className={styles.headerRight}>
        {/* NOTIFICATIONS */}
        <div className={styles.dropdownWrapper} ref={notificationRef}>
          <button
            type="button"
            className={styles.notification}
            aria-label={`Notifications: ${unreadCount} unread`}
            aria-expanded={showNotifications}
            onClick={toggleNotifications}
          >
            <Bell size={23} />

            {unreadCount > 0 && (
              <span className={styles.notificationDot}>{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <strong>Notifications</strong>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={markAllAsRead}
                  >
                    <CheckCheck size={15} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className={styles.notificationList}>
                {notificationsLoading && (
                  <p className={styles.emptyState}>Loading notifications...</p>
                )}

                {!notificationsLoading && notificationError && (
                  <p className={styles.emptyState}>{notificationError}</p>
                )}

                {!notificationsLoading &&
                  !notificationError &&
                  notifications.length === 0 && (
                    <p className={styles.emptyState}>No notifications yet.</p>
                  )}
                {notifications.slice(0, 5).map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    className={`${styles.notificationItem} ${
                      notification.unread ? styles.unread : ""
                    }`}
                    onClick={async () => {
                      if (notification.unread){

                      try {
                        await api.patch(
                          `/notifications/${notification.id}/read`
                        );

                        setNotifications((previous) =>
                          previous.map((item) =>
                            item.id === notification.id
                              ? { ...item, unread: false, is_read: 1 }
                              : item
                          )
                        );
                      } catch (error) {
                        console.error(
                          "Failed to mark notification as read:",
                          error
                        );
                      }
                    }
                      setShowNotifications(false);
                      navigate("/notifications");
                    }
                  }
                  >
                    <span className={styles.notificationTitle}>
                      {notification.title}
                      {notification.unread && (
                        <span className={styles.unreadDot} />
                      )}
                    </span>

                    <span className={styles.notificationMessage}>
                      {notification.message}
                    </span>

                    <span className={styles.notificationTime}>
                      {notification.time}
                    </span>
                  </button>
                ))}

                <div className={styles.viewMoreContainer}>
                  <Link
                    to="/notifications"
                    className={styles.viewMoreLink}
                    onClick={() => setShowNotifications(false)}
                  >
                    View More Notifications
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE */}
        <div className={styles.dropdownWrapper} ref={profileRef}>
          <button
            type="button"
            className={styles.profile}
            aria-expanded={showProfile}
            onClick={toggleProfile}
          >
            <UserCircle size={39} />

            <div className={styles.profileInfo}>
              <strong>{user?.full_name || "Loading..."}</strong>
              <span>{user?.role?.replace(/_/g, " ") || "User"}</span>
            </div>

            <ChevronDown
              size={15}
              className={showProfile ? styles.rotateIcon : ""}
            />
          </button>

          {showProfile && (
            <div className={`${styles.dropdown} ${styles.profileDropdown}`}>
              <div className={styles.profileSummary}>
                <UserCircle size={42} />
                <div>
                  <strong>{user?.full_name || "Loading..."}</strong>
                  <span>{user?.role?.replace(/_/g, " ") || "User"}</span>
                </div>
              </div>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={styles.dropdownAction}
                onClick={() => {
                  setShowProfile(false);
                  navigate("/profile");
                }}
              >
                <User size={18} />
                My Profile
              </button>

              <button
                type="button"
                className={styles.dropdownAction}
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
              >
                <Settings size={18} />
                Settings
              </button>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={`${styles.dropdownAction} ${styles.logoutAction}`}
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}