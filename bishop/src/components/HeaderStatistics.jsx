import React from "react";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

const HeaderStatistics = ({ trades }) => {
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
      };
    }

    const totalTrades = trades.length;
    const winningTrades = trades.filter((trade) => trade.pnl > 0);
    const losingTrades = trades.filter((trade) => trade.pnl < 0);
    const winRate = (winningTrades.length / totalTrades) * 100;

    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
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
    };
  };

  const stats = calculateStats();

  const statBoxes = [
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
      value: stats.profitFactor.toFixed(2),
      subtext: "Profit Factor",
      trend: stats.profitFactor >= 1.5 ? "up" : "down",
      details: [
        `Max DD: $${stats.maxDrawdown.toFixed(2)}`,
        `Risk Ratio: ${(stats.avgWinSize / stats.avgLossSize).toFixed(2)}`,
      ],
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
        </div>
      ))}
    </div>
  );
};

export default HeaderStatistics;
