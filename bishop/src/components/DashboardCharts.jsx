import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { FiChevronDown } from "react-icons/fi";

const DashboardCharts = ({ trades }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Process trades data for charts
  const processTradesData = () => {
    if (!trades || trades.length === 0) return [];

    // Sort trades by date
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    let cumulativeSum = 0;
    return sortedTrades
      .map((trade) => {
        try {
          cumulativeSum += Number(trade.pnl);
          const date = parseISO(trade.createdAt);
          return {
            name: format(date, "MMM d"),
            pnl: Number(trade.pnl),
            cumulative: cumulativeSum,
          };
        } catch (error) {
          console.error("Error processing trade:", trade, error);
          return null;
        }
      })
      .filter(Boolean);
  };

  const data = processTradesData();

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "";
    return `$${value.toFixed(2)}`;
  };

  const chartStyle = {
    backgroundColor: "#141414",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
    padding: "24px",
    marginBottom: "24px",
    transition: "all 0.3s ease",
  };

  const toggleButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "16px",
    transition: "all 0.2s ease",
  };

  const chartsContainerStyle = {
    maxHeight: isCollapsed ? "0" : "850px",
    overflow: "hidden",
    transition: "max-height 0.3s ease-in-out",
    opacity: isCollapsed ? "0" : "1",
  };

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          ...chartStyle,
          padding: "48px",
          textAlign: "center",
          color: "#888",
        }}
      >
        No trade data available
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={toggleButtonStyle}
      >
        <FiChevronDown
          size={20}
          style={{
            transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
        {isCollapsed ? "Show Charts" : "Hide Charts"}
      </button>

      <div style={chartsContainerStyle}>
        {/* Daily P&L Chart */}
        <div style={{ ...chartStyle, height: "400px" }}>
          <h3 style={{ color: "#888", fontSize: "14px", marginBottom: "16px" }}>
            Daily P&L
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="name"
                stroke="#888"
                tick={{ fill: "#888", fontSize: 11 }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                stroke="#888"
                tick={{ fill: "#888", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [`$${Math.abs(value).toFixed(2)}`, "P&L"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pnl"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ r: 4, fill: "#22C55E" }}
                activeDot={{ r: 6 }}
                name="Daily P&L"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative P&L Chart */}
        <div style={{ ...chartStyle, height: "400px" }}>
          <h3 style={{ color: "#888", fontSize: "14px", marginBottom: "16px" }}>
            Cumulative P&L
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="name"
                stroke="#888"
                tick={{ fill: "#888", fontSize: 11 }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                stroke="#888"
                tick={{ fill: "#888", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [
                  `$${Math.abs(value).toFixed(2)}`,
                  "Cumulative P&L",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ r: 4, fill: "#22C55E" }}
                activeDot={{ r: 6 }}
                name="Cumulative P&L"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
