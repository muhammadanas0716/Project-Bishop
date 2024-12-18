import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from "recharts";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  differenceInMinutes,
} from "date-fns";

const COLORS = ["#22C55E", "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6"];

// Add font family constant at the top with other constants
const FONT_FAMILY =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";

// Add chart style constants
const CHART_STYLES = {
  axisLine: { stroke: "#404040" },
  tick: {
    fill: "#888",
    fontFamily: FONT_FAMILY,
    fontSize: "12px",
    letterSpacing: "0.01em",
  },
  grid: { stroke: "#2a2a2a" },
};

const formatValue = (value) => {
  if (typeof value === "number") {
    // Handle percentages
    if (Math.abs(value) < 100 && value.toString().includes(".")) {
      return `${value.toFixed(2)}%`;
    }
    // Handle dollar amounts
    return value >= 0
      ? `$${value.toFixed(2)}`
      : `-$${Math.abs(value).toFixed(2)}`;
  }
  return value;
};

// Add descriptions for each chart type
const CHART_DESCRIPTIONS = {
  "Win Rate":
    "Shows the percentage of profitable trades vs losing trades. A higher win rate indicates more consistent profitability.",
  "Profit Factor":
    "Ratio of gross profits to gross losses. A value above 1 indicates overall profitability, with higher values showing stronger performance.",
  "Average Win":
    "The average profit from winning trades. Helps understand the typical profit potential of your strategy.",
  "Average Loss":
    "The average loss from losing trades. Helps manage risk by understanding typical downside.",
  "Strategy Performance":
    "Compares the performance of different trading strategies, showing total P&L for each approach.",
  "Win/Loss Distribution":
    "Pie chart showing the proportion of winning vs losing trades.",
  "Trade Type Distribution by Instrument":
    "Shows winning trades (right) and losing trades (left) for each instrument. Helps identify which instruments you trade most successfully.",
  "Cumulative P&L":
    "Shows your total profit/loss over time. The slope indicates performance trends and consistency.",
  "Profitability by Instrument":
    "Compares total profit/loss across different trading instruments. Helps identify your most profitable markets.",
  "Win Rate by Instrument":
    "Shows win rate percentage for each instrument. Helps identify which instruments you trade most consistently.",
  "Average Return by Option Type":
    "Compares the average return between calls and puts for each instrument. Helps identify which option types perform better.",
  "Risk-Reward Ratio by Instrument":
    "Scatter plot showing risk-reward relationships for each instrument. Helps optimize position sizing and profit targets.",
  "Position Size vs Return":
    "Shows how position size affects returns. Helps optimize position sizing for better risk management.",
};

const TradeAnalysis = ({ trades }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M"); // 1W, 1M, 3M, 6M, 1Y, ALL

  const calculateStats = () => {
    if (!trades || trades.length === 0) return null;

    // Win/Loss Stats
    const winningTrades = trades.filter((trade) => trade.pnl > 0);
    const losingTrades = trades.filter((trade) => trade.pnl < 0);
    const winRate = (winningTrades.length / trades.length) * 100;
    const avgWinSize =
      winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length;
    const avgLossSize = Math.abs(
      losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length
    );
    const largestWin = Math.max(...trades.map((t) => t.pnl));
    const largestLoss = Math.min(...trades.map((t) => t.pnl));

    // Profit Factor and Risk Metrics
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor =
      grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    // Streak Analysis
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    trades.forEach((trade, i) => {
      if (trade.pnl >= 0) {
        currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
      } else {
        currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
        maxLossStreak = Math.max(maxLossStreak, Math.abs(currentStreak));
      }
    });

    // Time-based Analysis
    const hourlyData = Array(24)
      .fill(0)
      .map((_, hour) => ({
        hour,
        trades: trades.filter((t) => new Date(t.createdAt).getHours() === hour)
          .length,
        pnl: trades
          .filter((t) => new Date(t.createdAt).getHours() === hour)
          .reduce((sum, t) => sum + t.pnl, 0),
      }));

    // Strategy Performance
    const strategyPerformance = trades.reduce((acc, trade) => {
      const strategy = trade.strategy || "Unknown";
      if (!acc[strategy]) {
        acc[strategy] = { pnl: 0, count: 0, winRate: 0 };
      }
      acc[strategy].pnl += trade.pnl;
      acc[strategy].count++;
      acc[strategy].winRate =
        (trades.filter((t) => t.strategy === strategy && t.pnl > 0).length /
          trades.filter((t) => t.strategy === strategy).length) *
        100;
      return acc;
    }, {});

    // Risk/Reward Analysis
    const riskRewardRatio = avgWinSize / avgLossSize;
    const expectancy =
      (winRate / 100) * avgWinSize - ((100 - winRate) / 100) * avgLossSize;

    // New calculations for instrument-based analysis
    const instrumentStats = trades.reduce((acc, trade) => {
      const ticker = trade.ticker || "Unknown";
      if (!acc[ticker]) {
        acc[ticker] = {
          totalPnL: 0,
          trades: 0,
          wins: 0,
          avgReturn: 0,
          totalReturn: 0,
          calls: { count: 0, totalReturn: 0 },
          puts: { count: 0, totalReturn: 0 },
          riskRewardRatios: [],
          positionSizes: [],
          returns: [],
        };
      }

      acc[ticker].totalPnL += trade.pnl;
      acc[ticker].trades += 1;
      acc[ticker].wins += trade.pnl > 0 ? 1 : 0;
      acc[ticker].totalReturn += trade.pnlPercent || 0;

      // Track call vs put performance
      if (trade.optionType === "CALL") {
        acc[ticker].calls.count += 1;
        acc[ticker].calls.totalReturn += trade.pnlPercent || 0;
      } else if (trade.optionType === "PUT") {
        acc[ticker].puts.count += 1;
        acc[ticker].puts.totalReturn += trade.pnlPercent || 0;
      }

      // Track position sizes and returns for scatter plot
      acc[ticker].positionSizes.push({
        size: trade.quantity || 0,
        return: trade.pnlPercent || 0,
        pnl: trade.pnl,
      });

      // Calculate risk-reward ratio if we have entry and exit prices
      if (trade.entryPrice && trade.exitPrice) {
        const riskReward = Math.abs(
          (trade.exitPrice - trade.entryPrice) / trade.entryPrice
        );
        acc[ticker].riskRewardRatios.push({
          ratio: riskReward,
          win: trade.pnl > 0,
          pnl: trade.pnl,
        });
      }

      return acc;
    }, {});

    // Calculate averages and format data for charts
    Object.keys(instrumentStats).forEach((ticker) => {
      const stats = instrumentStats[ticker];
      stats.winRate = (stats.wins / stats.trades) * 100;
      stats.avgReturn = stats.totalReturn / stats.trades;
      stats.calls.avgReturn = stats.calls.count
        ? stats.calls.totalReturn / stats.calls.count
        : 0;
      stats.puts.avgReturn = stats.puts.count
        ? stats.puts.totalReturn / stats.puts.count
        : 0;
    });

    // Add time-based analysis
    const timeHeldAnalysis = trades.map((trade) => {
      const entryTime = new Date(trade.entryTime || trade.createdAt);
      const exitTime = new Date(trade.exitTime || trade.updatedAt);
      return {
        ticker: trade.ticker || "Unknown",
        duration: differenceInMinutes(exitTime, entryTime),
        return: trade.pnlPercent || 0,
        pnl: trade.pnl,
        optionType: trade.optionType,
      };
    });

    return {
      winRate,
      avgWinSize,
      avgLossSize,
      largestWin,
      largestLoss,
      profitFactor,
      maxWinStreak,
      maxLossStreak,
      hourlyData,
      strategyPerformance,
      riskRewardRatio,
      expectancy,
      instrumentStats,
      timeHeldAnalysis,
    };
  };

  const stats = calculateStats();
  if (!stats) return <div>No trade data available</div>;

  const strategyData = Object.entries(stats.strategyPerformance).map(
    ([name, data]) => ({
      name,
      pnl: data.pnl,
      trades: data.count,
      winRate: data.winRate,
    })
  );

  const instrumentProfitability = Object.entries(stats.instrumentStats).map(
    ([ticker, data]) => ({
      name: ticker,
      pnl: data.totalPnL,
      trades: data.trades,
      winRate: data.winRate,
    })
  );

  const instrumentWinRates = Object.entries(stats.instrumentStats).map(
    ([ticker, data]) => ({
      name: ticker,
      value: data.winRate,
      trades: data.trades,
    })
  );

  const optionTypeReturns = Object.entries(stats.instrumentStats).map(
    ([ticker, data]) => ({
      name: ticker,
      calls: data.calls.avgReturn,
      puts: data.puts.avgReturn,
    })
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "12px 16px",
          border: "1px solid #333",
          borderRadius: "6px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          fontFamily: FONT_FAMILY,
        }}
      >
        <div
          style={{
            color: "#888",
            fontSize: "12px",
            marginBottom: "8px",
            borderBottom: "1px solid #333",
            paddingBottom: "4px",
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          {typeof label === "number" && payload[0]?.name === "pnl"
            ? `${String(label).padStart(2, "0")}:00`
            : label}
        </div>
        {payload.map((entry, index) => (
          <div
            key={index}
            style={{
              color: "#fff",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 0",
              letterSpacing: "0.01em",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: entry.color,
              }}
            />
            <span style={{ color: "#888", fontWeight: 500 }}>
              {entry.name}:
            </span>
            <span style={{ marginLeft: "auto", fontWeight: 500 }}>
              {formatValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const Widget = ({ title, children, height = "300px" }) => (
    <div
      style={{
        backgroundColor: "#141414",
        borderRadius: "12px",
        padding: "20px",
        height,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        fontFamily: FONT_FAMILY,
      }}
    >
      <h3
        style={{
          color: "#888",
          fontSize: "14px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: FONT_FAMILY,
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}
      >
        <span style={{ fontSize: "16px" }}>
          {title === "Win Rate" && "🎯"}
          {title === "Profit Factor" && "💰"}
          {title === "Average Win" && "📈"}
          {title === "Average Loss" && "📉"}
          {title === "Strategy Performance" && "🎮"}
          {title === "Win/Loss Distribution" && "🍩"}
          {title === "Trade Type Distribution by Instrument" && "📊"}
          {title === "Cumulative P&L" && "💵"}
          {title === "Profitability by Instrument" && "📊"}
          {title === "Win Rate by Instrument" && "🎯"}
          {title === "Average Return by Option Type" && "📈"}
          {title === "Risk-Reward Ratio by Instrument" && "⚖️"}
          {title === "Position Size vs Return" && "🎲"}
        </span>
        {title}
        <div style={{ position: "relative", display: "inline-block" }}>
          <span
            style={{
              cursor: "help",
              fontSize: "14px",
              color: "#666",
            }}
            onMouseEnter={(e) => {
              const tooltip = e.currentTarget.nextElementSibling;
              if (tooltip) tooltip.style.display = "block";
            }}
            onMouseLeave={(e) => {
              const tooltip = e.currentTarget.nextElementSibling;
              if (tooltip) tooltip.style.display = "none";
            }}
          >
            ℹ️
          </span>
          <div
            style={{
              display: "none",
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#1a1a1a",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              width: "220px",
              zIndex: 1000,
              border: "1px solid #333",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              marginTop: "8px",
              fontFamily: FONT_FAMILY,
              lineHeight: "1.5",
              letterSpacing: "0.01em",
            }}
          >
            {CHART_DESCRIPTIONS[title]}
            <div
              style={{
                position: "absolute",
                top: "-5px",
                left: "50%",
                width: "8px",
                height: "8px",
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRight: "none",
                borderBottom: "none",
                transform: "translate(-50%, -50%) rotate(45deg)",
              }}
            />
          </div>
        </div>
      </h3>
      <div style={{ height: "calc(100% - 40px)" }}>{children}</div>
    </div>
  );

  // Add new data transformations after existing ones
  const positionSizeData = Object.entries(stats.instrumentStats).flatMap(
    ([ticker, data]) =>
      data.positionSizes.map((pos) => ({
        ticker,
        size: pos.size,
        return: pos.return,
        pnl: pos.pnl,
      }))
  );

  const riskRewardData = Object.entries(stats.instrumentStats).flatMap(
    ([ticker, data]) =>
      data.riskRewardRatios.map((rr) => ({
        ticker,
        ratio: rr.ratio,
        win: rr.win,
        pnl: rr.pnl,
      }))
  );

  // Add new data transformations
  const timeHeldData = stats.timeHeldAnalysis;

  const tradeTypeDistribution = Object.entries(stats.instrumentStats)
    .map(([ticker, data]) => ({
      name: ticker,
      wins: data.wins,
      losses: -1 * (data.trades - data.wins),
    }))
    .sort(
      (a, b) =>
        Math.abs(a.wins) +
        Math.abs(a.losses) -
        (Math.abs(b.wins) + Math.abs(b.losses))
    );

  // Update chart components with consistent styling
  const chartComponents = {
    BarChart: (props) => (
      <BarChart {...props}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_STYLES.grid.stroke}
        />
        <XAxis {...CHART_STYLES.axisLine} tick={CHART_STYLES.tick} />
        <YAxis {...CHART_STYLES.axisLine} tick={CHART_STYLES.tick} />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
        />
        {props.children}
      </BarChart>
    ),
    // ... similar updates for other chart types
  };

  return (
    <div
      style={{
        display: "grid",
        gap: "24px",
        gridTemplateColumns: "repeat(12, 1fr)",
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Key Metrics Row */}
      <div style={{ gridColumn: "span 3" }}>
        <Widget title="Win Rate" height="120px">
          <div
            style={{
              fontSize: "32px",
              color: "#fff",
              fontWeight: "600",
              letterSpacing: "-0.02em",
            }}
          >
            {stats.winRate.toFixed(1)}%
          </div>
          <div
            style={{
              color: "#666",
              fontSize: "14px",
              fontWeight: "500",
              letterSpacing: "0.01em",
            }}
          >
            {stats.maxWinStreak} trades max streak
          </div>
        </Widget>
      </div>
      <div style={{ gridColumn: "span 3" }}>
        <Widget title="Profit Factor" height="120px">
          <div style={{ fontSize: "32px", color: "#fff", fontWeight: "500" }}>
            {stats.profitFactor.toFixed(2)}
          </div>
          <div style={{ color: "#666", fontSize: "14px" }}>
            Risk/Reward: {stats.riskRewardRatio.toFixed(2)}
          </div>
        </Widget>
      </div>
      <div style={{ gridColumn: "span 3" }}>
        <Widget title="Average Win" height="120px">
          <div
            style={{ fontSize: "32px", color: "#22C55E", fontWeight: "500" }}
          >
            ${stats.avgWinSize.toFixed(2)}
          </div>
          <div style={{ color: "#666", fontSize: "14px" }}>
            Best: ${stats.largestWin.toFixed(2)}
          </div>
        </Widget>
      </div>
      <div style={{ gridColumn: "span 3" }}>
        <Widget title="Average Loss" height="120px">
          <div
            style={{ fontSize: "32px", color: "#EF4444", fontWeight: "500" }}
          >
            -${stats.avgLossSize.toFixed(2)}
          </div>
          <div style={{ color: "#666", fontSize: "14px" }}>
            Worst: -${Math.abs(stats.largestLoss).toFixed(2)}
          </div>
        </Widget>
      </div>

      {/* Strategy Performance */}
      <div style={{ gridColumn: "span 8" }}>
        <Widget title="Strategy Performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={strategyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_STYLES.grid.stroke}
              />
              <XAxis
                dataKey="name"
                {...CHART_STYLES.axisLine}
                tick={{ ...CHART_STYLES.tick, fontSize: "12px" }}
                height={40}
              />
              <YAxis
                {...CHART_STYLES.axisLine}
                tick={{ ...CHART_STYLES.tick, fontSize: "12px" }}
                width={60}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
              />
              <Bar dataKey="pnl" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Widget>
      </div>

      {/* Win/Loss Distribution */}
      <div style={{ gridColumn: "span 4" }}>
        <Widget title="Win/Loss Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Wins", value: stats.winRate },
                  { name: "Losses", value: 100 - stats.winRate },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name} (${value.toFixed(1)}%)`}
                labelLine={false}
              >
                <Cell fill="#22C55E" />
                <Cell fill="#EF4444" />
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
        </Widget>
      </div>

      {/* Trade Type Distribution - Modified */}
      <div style={{ gridColumn: "span 12" }}>
        <Widget title="Trade Type Distribution by Instrument" height="400px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={tradeTypeDistribution}
              margin={{ top: 20, right: 20, bottom: 20, left: 60 }}
              layout="vertical"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_STYLES.grid.stroke}
              />
              <XAxis
                type="number"
                {...CHART_STYLES.axisLine}
                tick={{ ...CHART_STYLES.tick, fontSize: "12px" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                {...CHART_STYLES.axisLine}
                tick={{ ...CHART_STYLES.tick, fontSize: "12px" }}
                width={100}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
              />
              <Bar
                dataKey="wins"
                name="Wins"
                fill="#22C55E"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="losses"
                name="Losses"
                fill="#EF4444"
                radius={[4, 0, 0, 4]}
              />
              <ReferenceLine x={0} stroke="#404040" />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px",
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Widget>
      </div>

      {/* Cumulative P&L */}
      <div style={{ gridColumn: "span 12" }}>
        <Widget title="Cumulative P&L">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trades.map((trade, index) => ({
                trade: index + 1,
                pnl: trades
                  .slice(0, index + 1)
                  .reduce((sum, t) => sum + t.pnl, 0),
              }))}
              margin={{ top: 10, right: 20, bottom: 20, left: 60 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_STYLES.grid.stroke}
              />
              <XAxis
                dataKey="trade"
                {...CHART_STYLES.axisLine}
                tick={{ ...CHART_STYLES.tick, fontSize: "12px" }}
                height={40}
              />
              <YAxis
                {...CHART_STYLES.axisLine}
                tick={{ ...CHART_STYLES.tick, fontSize: "12px" }}
                width={60}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(255, 255, 255, 0.2)" }}
              />
              <Line
                type="monotone"
                dataKey="pnl"
                name="P&L"
                stroke="#22C55E"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Widget>
      </div>

      {/* Profitability by Instrument */}
      <div style={{ gridColumn: "span 8" }}>
        <Widget title="Profitability by Instrument">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={instrumentProfitability}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" fill="#22C55E">
                {instrumentProfitability.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.pnl >= 0 ? "#22C55E" : "#EF4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Widget>
      </div>

      {/* Win Rate by Instrument */}
      <div style={{ gridColumn: "span 4" }}>
        <Widget title="Win Rate by Instrument">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={instrumentWinRates}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {instrumentWinRates.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Widget>
      </div>

      {/* Average Return by Option Type */}
      <div style={{ gridColumn: "span 12" }}>
        <Widget title="Average Return by Option Type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={optionTypeReturns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calls" name="Calls" fill="#22C55E" />
              <Bar dataKey="puts" name="Puts" fill="#3B82F6" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </Widget>
      </div>

      {/* Risk-Reward Ratio Analysis */}
      <div style={{ gridColumn: "span 6" }}>
        <Widget title="Risk-Reward Ratio by Instrument">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                type="category"
                dataKey="ticker"
                name="Instrument"
                stroke="#888"
              />
              <YAxis
                type="number"
                dataKey="ratio"
                name="Risk-Reward Ratio"
                stroke="#888"
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={riskRewardData} fill="#8B5CF6">
                {riskRewardData.map((entry, index) => (
                  <Cell key={index} fill={entry.win ? "#22C55E" : "#EF4444"} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Widget>
      </div>

      {/* Position Size vs Return */}
      <div style={{ gridColumn: "span 6" }}>
        <Widget title="Position Size vs Return">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_STYLES.grid.stroke}
              />
              <XAxis
                type="number"
                dataKey="size"
                name="Position Size"
                {...CHART_STYLES.axisLine}
                tick={{ ...CHART_STYLES.tick, fontSize: "12px" }}
                height={40}
              />
              <YAxis
                type="number"
                dataKey="return"
                name="Return %"
                {...CHART_STYLES.axisLine}
                tick={{ ...CHART_STYLES.tick, fontSize: "12px" }}
                width={60}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter data={positionSizeData} fill="#8B5CF6">
                {positionSizeData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.pnl >= 0 ? "#22C55E" : "#EF4444"}
                    fillOpacity={0.6}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Widget>
      </div>
    </div>
  );
};

export default TradeAnalysis;
