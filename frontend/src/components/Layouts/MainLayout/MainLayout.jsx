import React, { useState } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import styles from "./MainLayout.module.css";
import { useNavigate } from "react-router-dom";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    };

  
  return (
    <div className={styles.layout}>
      <div
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}

        aria-hidden={!sidebarOpen}
      >
        <Sidebar sidebarOpen={sidebarOpen} />
      </div>

      <div className={styles.main}>
        <Navbar
          onMenuClick={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
          onLogout={handleLogout}
        />

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
