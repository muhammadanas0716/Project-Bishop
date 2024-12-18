import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import LastImport from "../components/LastImport";
import HeaderStatistics from "../components/HeaderStatistics";
import QuickStats from "../components/QuickStats";
import TradeAnalysis from "../components/TradeAnalysis";
import Sidebar from "../components/Sidebar";
import DashboardCharts from "../components/DashboardCharts";
import TradesTable from "../components/TradesTable";
import TradeCalendar from "../components/TradeCalendar";

const API_URL = "http://localhost:5001/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [view, setView] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Create axios instance with auth header
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get("/trades");
      setTrades(response.data);
      setLastSync(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching trades:", err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError("Failed to load trades. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrade = async (newTrade) => {
    try {
      const response = await authAxios.post("/trades", newTrade);
      setTrades((prevTrades) => [response.data, ...prevTrades]);
      setLastSync(new Date());
      return true;
    } catch (err) {
      console.error("Error adding trade:", err);
      if (err.response?.status === 401) {
        logout();
      }
      throw new Error("Failed to add trade");
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    try {
      await authAxios.delete(`/trades/${tradeId}`);
      setTrades((prevTrades) =>
        prevTrades.filter((trade) => trade._id !== tradeId)
      );
      return true;
    } catch (err) {
      console.error("Error deleting trade:", err);
      if (err.response?.status === 401) {
        logout();
      }
      throw new Error("Failed to delete trade");
    }
  };

  const handleUpdateTrade = async (tradeId, updatedData) => {
    try {
      const response = await authAxios.put(`/trades/${tradeId}`, updatedData);
      setTrades((prevTrades) =>
        prevTrades.map((trade) =>
          trade._id === tradeId ? response.data : trade
        )
      );
      return true;
    } catch (err) {
      console.error("Error updating trade:", err);
      if (err.response?.status === 401) {
        logout();
      }
      throw new Error("Failed to update trade");
    }
  };

  const handleHardReset = async () => {
    try {
      setLoading(true);
      await authAxios.delete("/trades/reset");
      setTrades([]);
      setLastSync(new Date());
      setError(null);
      // Show success message
      alert("All trades have been successfully deleted.");
    } catch (err) {
      console.error("Error resetting trades:", err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError("Failed to reset trades. Please try again later.");
        alert("Failed to reset trades. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-10">
          <div className="loading-spinner" />
          <p className="ml-3">Loading trades...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 m-5 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    switch (view) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <QuickStats trades={trades} />
            <HeaderStatistics trades={trades} />
            <TradeCalendar trades={trades} />
            <DashboardCharts trades={trades} />
            <TradesTable
              trades={trades}
              onAddTrade={handleAddTrade}
              onDeleteTrade={handleDeleteTrade}
              onUpdateTrade={handleUpdateTrade}
            />
          </div>
        );
      case "analysis":
        return <TradeAnalysis trades={trades} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        color: "#FFFFFF",
        display: "flex",
      }}
    >
      <Sidebar
        activeView={view}
        onViewChange={setView}
        isCollapsed={isSidebarCollapsed}
        onCollapse={setIsSidebarCollapsed}
        username={user?.username}
        onLogout={logout}
        onHardReset={handleHardReset}
      />
      <div
        style={{
          flex: 1,
          marginLeft: isSidebarCollapsed ? "128px" : "288px",
          padding: "24px 40px",
          minHeight: "100vh",
          transition: "all 0.3s ease",
          maxWidth: "1400px",
          width: "100%",
        }}
      >
        <Header />
        <LastImport lastSync={lastSync} />
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
