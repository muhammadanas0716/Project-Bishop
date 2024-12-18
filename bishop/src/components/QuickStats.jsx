import React from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiDollarSign,
  FiPercent,
} from "react-icons/fi";

const QuickStats = ({ trades }) => {
  const calculateDailyStats = () => {
    if (!trades || trades.length === 0)
      return { todayPnL: 0, todayTrades: 0, weekPnL: 0, monthPnL: 0 };

    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayTrades = trades.filter(
      (trade) => new Date(trade.createdAt) >= todayStart
    );
    const weekTrades = trades.filter(
      (trade) => new Date(trade.createdAt) >= weekStart
    );
    const monthTrades = trades.filter(
      (trade) => new Date(trade.createdAt) >= monthStart
    );

    return {
      todayPnL: todayTrades.reduce((sum, trade) => sum + trade.pnl, 0),
      todayTrades: todayTrades.length,
      weekPnL: weekTrades.reduce((sum, trade) => sum + trade.pnl, 0),
      monthPnL: monthTrades.reduce((sum, trade) => sum + trade.pnl, 0),
    };
  };

  const stats = calculateDailyStats();

  const quickStats = [
    {
      label: "Today's P&L",
      value: `$${stats.todayPnL.toFixed(2)}`,
      icon: <FiDollarSign size={16} />,
      color: stats.todayPnL >= 0 ? "#22C55E" : "#EF4444",
    },
    {
      label: "Today's Trades",
      value: stats.todayTrades,
      icon: <FiClock size={16} />,
      color: "#888",
    },
    {
      label: "7-Day P&L",
      value: `$${stats.weekPnL.toFixed(2)}`,
      icon: <FiTrendingUp size={16} />,
      color: stats.weekPnL >= 0 ? "#22C55E" : "#EF4444",
    },
    {
      label: "MTD P&L",
      value: `$${stats.monthPnL.toFixed(2)}`,
      icon: <FiTrendingDown size={16} />,
      color: stats.monthPnL >= 0 ? "#22C55E" : "#EF4444",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        padding: "12px 24px",
        backgroundColor: "#0D0D0D",
        borderRadius: "12px",
        marginBottom: "24px",
        border: "1px solid #2a2a2a",
      }}
    >
      {quickStats.map((stat, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: 1,
            padding: "8px 16px",
            backgroundColor: "#141414",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              backgroundColor: "#1A1A1A",
              borderRadius: "8px",
              color: stat.color,
            }}
          >
            {stat.icon}
          </div>
          <div>
            <div
              style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}
            >
              {stat.label}
            </div>
            <div
              style={{ fontSize: "16px", fontWeight: "500", color: stat.color }}
            >
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
