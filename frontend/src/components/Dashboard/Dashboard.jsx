import React from "react";
import Sidebar from "../Layouts/Sidebar/Sidebar";
import Navbar from "../Layouts/Navbar/Navbar";
import {
  Wrench,
  CheckCircle2,
  Package,
  AlertTriangle,
  Cog,
  MapPin,
  CalendarClock,
} from "lucide-react";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import styles from "./Dashboard.module.css";


const statistics = [
  {
    label: "Total Tools",
    value: "1,248",
    icon: Wrench,
    color: "green",
  },
  {
    label: "Available",
    value: "986",
    icon: CheckCircle2,
    color: "emerald",
  },
  {
    label: "Issued",
    value: "231",
    icon: Package,
    color: "blue",
  },
  {
    label: "Overdue",
    value: "7",
    icon: AlertTriangle,
    color: "red",
  },
  {
    label: "Under Maintenance",
    value: "18",
    icon: Cog,
    color: "orange",
  },
  {
    label: "Missing",
    value: "3",
    icon: MapPin,
    color: "danger",
  },
];

const fleet = [
  { registration: "B737 MAX", status: "Operational", tools: 166 },
  { registration: "B737 NG", status: "Operational", tools: 172 },
  { registration: "B777", status: "Operational", tools: 161 },
  { registration: "B787", status: "Operational", tools: 155 },
  { registration: "B767", status: "Operational", tools: 156 },
  { registration: "Q400", status: "Operational", tools: 96 },
];

const toolStatus = [
  { name: "Available", value: 986, color: "#079b4b" },
  { name: "Issued", value: 231, color: "#1473e6" },
  { name: "Overdue", value: 7, color: "#ed2929" },
  { name: "Maintenance", value: 18, color: "#f59e0b" },
  { name: "Missing", value: 3, color: "#dc2626" },
];

const transactions = [
  {
    time: "08:31",
    type: "Tool Issued",
    toolId: "SMTL-IT-000134",
    technician: "Abebe K.",
    simulator: "B737 MAX-2",
  },
  {
    time: "08:18",
    type: "Tool Returned",
    toolId: "SMTL-IT-000111",
    technician: "Daniel T.",
    simulator: "B787",
  },
  {
    time: "08:52",
    type: "Calibration",
    toolId: "CAL-00321",
    technician: "Muluem A.",
    simulator: "Q400",
  },
];


function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <article className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[item.color]}`}>
        <Icon size={25} strokeWidth={2.5} />
      </div>

      <div className={styles.statInfo}>
        <span>{item.label}</span>
        <strong
          className={
            item.color === "red" || item.color === "danger"
              ? styles.dangerValue
              : ""
          }
        >
          {item.value}
        </strong>
      </div>
    </article>
  );
}

function FleetStatus() {
  return (
    <section className={`${styles.panel} ${styles.fleetPanel}`}>
      <h2>Simulator Fleet Status</h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Registration</th>
              <th>Status</th>
              <th>Tools</th>
            </tr>
          </thead>

          <tbody>
            {fleet.map((aircraft) => (
              <tr key={aircraft.registration}>
                <td>{aircraft.registration}</td>
                <td>
                  <span className={styles.operational}>
                    <span className={styles.statusDot} />
                    {aircraft.status}
                  </span>
                </td>
                <td>{aircraft.tools}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ToolStatus() {
  return (
    <section className={`${styles.panel} ${styles.chartPanel}`}>
      <h2>Tool Status Overview</h2>

      <div className={styles.chartLayout}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={toolStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="64%"
                outerRadius="88%"
                paddingAngle={2}
                stroke="none"
              >
                {toolStatus.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className={styles.chartCenter}>
            <strong>1,248</strong>
            <span>Total Tools</span>
          </div>
        </div>

        <div className={styles.legend}>
          {toolStatus.map((item) => {
            const percentage = Math.round((item.value / 1248) * 100);

            return (
              <div className={styles.legendItem} key={item.name}>
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: item.color }}
                />
                <span className={styles.legendName}>{item.name}</span>
                <strong>
                  {item.value.toLocaleString()} ({percentage}%)
                </strong>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RecentTransactions() {
  return (
    <section className={`${styles.panel} ${styles.transactionsPanel}`}>
      <div className={styles.panelHeading}>
        <h2>Recent Transactions</h2>
        <button className={styles.viewAll}>View all</button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={`${styles.table} ${styles.transactionTable}`}>
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>Type</th>
              <th>Tool ID</th>
              <th>Technician</th>
              <th>Simulator</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={`${transaction.toolId}-${index}`}>
                <td>{transaction.time}</td>
                <td>
                  <span
                    className={
                      transaction.type === "Calibration"
                        ? styles.calibrationType
                        : styles.transactionType
                    }
                  >
                    {transaction.type}
                  </span>
                </td>
                <td>{transaction.toolId}</td>
                <td>{transaction.technician}</td>
                <td>{transaction.simulator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <Sidebar />

      <main className={styles.main}>
        <Navbar />

        <div className={styles.content}>
          <div className={styles.pageHeading}>
            <div>
              <h1>Dashboard</h1>
              <p>Simulator Workshop Tool Management System</p>
            </div>

            <div className={styles.headerDate}>
              <CalendarClock size={17} />
              <span>Workshop Overview</span>
            </div>
          </div>

          <section className={styles.statsGrid}>
            {statistics.map((item) => (
              <StatCard key={item.label} item={item} />
            ))}
          </section>

          <div className={styles.dashboardGrid}>
            <FleetStatus />

            <div className={styles.rightColumn}>
              <ToolStatus />
              <RecentTransactions />
            </div>
          </div>

          <footer className={styles.footer}>
            Ethiopian Airlines · Simulator Workshop Management
          </footer>
        </div>
      </main>
    </div>
  );
}
