import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "../src/context/AuthContext";

import Login from "./pages/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import MainLayout from "./components/Layouts/MainLayout/MainLayout";

import ToolsList from "./pages/Tools/ToolsList";
import AddTool from "./pages/Tools/AddTools";

import IssueTool from "./pages/Transactions/IssueTool";
import ReturnTool from "./pages/Transactions/ReturnTool";
import TransactionHistory from "./pages/Transactions/TransactionHistory";

import Calibration from "./pages/Calibration/Calibration";
import Maintenance from "./pages/Maintenance/Maintenance";
import Simulators from "./pages/Simulators/Simulators";

import WorkOrders from "./pages/WorkOrders/WorkerOrders";
import WorkOrderDetails from "./pages/WorkOrders/WorkOrderDetails";

import Reports from "./pages/Reports/Reports";
import Users from "./pages/Users/Users";
import Settings from "./pages/Settings/Settings";
import Profile from "./pages/Profile/Profile";
import Notifications from "./pages/Notifications/Notifications";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mainlayout" element={<MainLayout />} />
          <Route path="/tools" element={<ToolsList />} />
          <Route path="/tools/add" element={<AddTool />} />
          <Route path="/transactions/issue" element={<IssueTool />} />
          <Route path="/transactions/return" element={<ReturnTool />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/calibration" element={<Calibration />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/simulators" element={<Simulators />} />
          <Route path="/work-orders" element={<WorkOrders />} />
          <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="Notifications" element={<Notifications />} />
          <Route path="*" element={<NavigateToDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function NavigateToDashboard() {
  return <Login />;
}

export default App;
