import React, { useState } from "react";
import { FiArrowUp, FiArrowDown, FiAlertCircle } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const HeaderStatistics = ({ trades }) => {
  const [showRiskMetrics, setShowRiskMetrics] = useState(false);
  const STARTING_BALANCE = 13791.97;

  // Calculate statistics from trades
  const calculateStats = () => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgPnL: 0,
        bestTrade: 0,
        worstTrade: 0,
        profitFactor: 0,
        avgWinSize: 0,
        avgLossSize: 0,
        maxDrawdown: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        currentBalance: STARTING_BALANCE,
      };
    }

    const totalTrades = trades.length;
    const winningTrades = trades.filter((trade) => trade.pnl > 0);
    const losingTrades = trades.filter((trade) => trade.pnl < 0);
    const winRate = (winningTrades.length / totalTrades) * 100;

    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const currentBalance = STARTING_BALANCE + totalPnL;
    const avgPnL = totalPnL / totalTrades;
    const bestTrade = Math.max(...trades.map((trade) => trade.pnl));
    const worstTrade = Math.min(...trades.map((trade) => trade.pnl));

    // Calculate profit factor (total wins / total losses)
    const totalWins = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLosses = Math.abs(
      losingTrades.reduce((sum, trade) => sum + trade.pnl, 0)
    );
    const profitFactor =
      totalLosses === 0 ? totalWins : totalWins / totalLosses;

    // Calculate average win and loss sizes
    const avgWinSize =
      winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const avgLossSize =
      losingTrades.length > 0 ? Math.abs(totalLosses / losingTrades.length) : 0;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningPnL = 0;
    trades.forEach((trade) => {
      runningPnL += trade.pnl;
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // Calculate consecutive wins/losses
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    trades.forEach((trade, i) => {
      if (i === 0) {
        currentStreak = trade.pnl >= 0 ? 1 : -1;
      } else {
        if (trade.pnl >= 0 && trades[i - 1].pnl >= 0) {
          currentStreak = Math.max(currentStreak + 1, 1);
          maxWinStreak = Math.max(maxWinStreak, currentStreak);
        } else if (trade.pnl < 0 && trades[i - 1].pnl < 0) {
          currentStreak = Math.min(currentStreak - 1, -1);
          maxLossStreak = Math.max(maxLossStreak, Math.abs(currentStreak));
        } else {
          currentStreak = trade.pnl >= 0 ? 1 : -1;
        }
      }
    });

    return {
      totalTrades,
      winRate,
      totalPnL,
      avgPnL,
      bestTrade,
      worstTrade,
      profitFactor,
      avgWinSize,
      avgLossSize,
      maxDrawdown,
      consecutiveWins: maxWinStreak,
      consecutiveLosses: maxLossStreak,
      currentBalance,
    };
  };

  // Calculate position size recommendations
  const getPositionSizeRecommendations = (balance) => {
    const maxRiskPercent = 0.02; // 2% max risk
    const baseSize = balance * maxRiskPercent;

    return {
      maxPosition: baseSize,
      recommended: baseSize * 0.75,
      conservative: baseSize * 0.5,
    };
  };

  // Prepare balance history data
  const balanceHistoryData = trades.reduce((acc, trade, index) => {
    const prevBalance = index > 0 ? acc[index - 1].balance : STARTING_BALANCE;
    acc.push({
      date: new Date(trade.createdAt).toLocaleDateString(),
      balance: prevBalance + trade.pnl,
      change: trade.pnl,
    });
    return acc;
  }, []);

  const stats = calculateStats();
  const positionSizes = getPositionSizeRecommendations(stats.currentBalance);

  const statBoxes = [
    {
      label: "Account Balance",
      value: `$${stats.currentBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: `Starting: $${STARTING_BALANCE.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      trend: stats.currentBalance >= STARTING_BALANCE ? "up" : "down",
      details: [
        `P&L: $${stats.totalPnL.toFixed(2)}`,
        `${((stats.totalPnL / STARTING_BALANCE) * 100).toFixed(1)}% return`,
      ],
      chart: balanceHistoryData.length > 0 && (
        <div style={{ height: "60px", marginTop: "10px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceHistoryData}>
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#22C55E"
                dot={false}
                strokeWidth={1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ),
    },
    {
      label: "Performance",
      value: `$${stats.totalPnL.toFixed(2)}`,
      subtext: `${stats.winRate.toFixed(1)}% Win Rate`,
      trend: stats.totalPnL >= 0 ? "up" : "down",
      details: [
        `Avg: $${stats.avgPnL.toFixed(2)}`,
        `${stats.totalTrades} trades`,
      ],
    },
    {
      label: "Win/Loss",
      value: `$${stats.avgWinSize.toFixed(2)}`,
      subtext: `-$${stats.avgLossSize.toFixed(2)} avg loss`,
      trend: "up",
      details: [
        `Best: $${stats.bestTrade.toFixed(2)}`,
        `Worst: $${stats.worstTrade.toFixed(2)}`,
      ],
    },
    {
      label: "Risk Metrics",
      value: (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setShowRiskMetrics(!showRiskMetrics)}
        >
          <FiAlertCircle size={24} />
        </div>
      ),
      subtext: "Position Sizing",
      details: showRiskMetrics
        ? [
            `Max: $${positionSizes.maxPosition.toFixed(2)}`,
            `Recommended: $${positionSizes.recommended.toFixed(2)}`,
            `Conservative: $${positionSizes.conservative.toFixed(2)}`,
          ]
        : ["Click to view", "position sizes"],
    },
    {
      label: "Streaks",
      value: `${stats.consecutiveWins}W`,
      subtext: `${stats.consecutiveLosses}L max streak`,
      trend: stats.consecutiveWins > stats.consecutiveLosses ? "up" : "down",
      details: [
        `${stats.totalTrades} total trades`,
        `${stats.winRate.toFixed(1)}% accuracy`,
      ],
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "24px",
        marginBottom: "24px",
      }}
    >
      {statBoxes.map((stat, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#141414",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #2a2a2a",
          }}
        >
          <div style={{ marginBottom: "8px", color: "#888", fontSize: "14px" }}>
            {stat.label}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{ fontSize: "24px", fontWeight: "500", color: "#fff" }}
            >
              {stat.value}
            </span>
            {stat.trend && (
              <span
                style={{
                  color: stat.trend === "up" ? "#22C55E" : "#EF4444",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {stat.trend === "up" ? (
                  <FiArrowUp size={20} />
                ) : (
                  <FiArrowDown size={20} />
                )}
              </span>
            )}
          </div>
          <div
            style={{ color: "#666", fontSize: "13px", marginBottom: "12px" }}
          >
            {stat.subtext}
          </div>
          <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: "12px" }}>
            {stat.details.map((detail, i) => (
              <div
                key={i}
                style={{
                  color: "#888",
                  fontSize: "12px",
                  marginTop: i > 0 ? "4px" : 0,
                }}
              >
                {detail}
              </div>
            ))}
          </div>
          {stat.chart && <div style={{ marginTop: "12px" }}>{stat.chart}</div>}
        </div>
      ))}
    </div>
  );
};

export default HeaderStatistics;
