import React from 'react'
import styles from './Sidebar.module.css'
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard,
  Wrench,
  ArrowLeftRight,
  Gauge,
  Settings,
  Plane,
  ClipboardList,
  FileText,
  Users,
  Cog
} from "lucide-react";


const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Tools", icon: Wrench, to: "/tools" },
  { label: "Transactions", icon: ArrowLeftRight, to: "/transactions" },
  { label: "Calibration", icon: Gauge, to: "/calibration" },
  { label: "Maintenance", icon: Settings, to: "/maintenance" },
  { label: "Simulators", icon: Plane, to: "/simulators" },
  { label: "Work Orders", icon: ClipboardList, to: "/work-orders" },
  { label: "Reports", icon: FileText, to: "/reports" },
  { label: "Users", icon: Users, to: "/users" },
  { label: "Settings", icon: Cog, to: "/settings" },
];


function Sidebar({ sidebarOpen }) {
  return (
    <aside
      className={`${styles.sidebar} ${
        sidebarOpen ? styles.open : styles.closed
      }`}
      aria-hidden={!sidebarOpen}
    >
      <div className={styles.brand}>
        <div className={styles.brandName}>
          Ethiopian <span>Airlines</span>
        </div>
        <div className={styles.brandMark}>➤</div>
      </div>

      <nav className={styles.navigation}>
        {navigation.map(({ label, icon: Icon, active, to}) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/dashboard"} // Set 'end' prop for the dashboard route
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ""}`
            }
            tabIndex={sidebarOpen ? 0 : -1}
          >
            <Icon size={21} strokeWidth={2.3} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Plane size={27} />
        <div>
          <strong>Aviation Academy</strong>
          <span>Ethiopian Airlines</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar