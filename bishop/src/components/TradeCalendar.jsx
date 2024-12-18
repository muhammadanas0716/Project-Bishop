import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import {
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiChevronDown,
} from "react-icons/fi";

const TradeCalendar = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCollapsed, setIsCollapsed] = useState(true);

  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: startOfCurrentMonth,
    end: endOfCurrentMonth,
  });

  // Process trades data for the month
  const getTradesByDate = () => {
    const tradeMap = {};

    trades.forEach((trade) => {
      const tradeDate = new Date(trade.createdAt);
      if (
        tradeDate.getMonth() !== currentDate.getMonth() ||
        tradeDate.getFullYear() !== currentDate.getFullYear()
      )
        return;

      const dateStr = format(tradeDate, "yyyy-MM-dd");
      if (!tradeMap[dateStr]) {
        tradeMap[dateStr] = {
          count: 0,
          pnl: 0,
        };
      }
      tradeMap[dateStr].count += 1;
      tradeMap[dateStr].pnl += trade.pnl;
    });

    return tradeMap;
  };

  const tradeMap = getTradesByDate();

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={toggleCollapse} style={collapseButtonStyle}>
            <FiChevronDown
              size={20}
              style={{
                transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </button>
          <button onClick={handlePrevMonth} style={arrowButtonStyle}>
            <FiChevronLeft size={20} />
          </button>
          <h2 style={titleStyle}>{format(currentDate, "MMMM yyyy")}</h2>
          <button onClick={handleNextMonth} style={arrowButtonStyle}>
            <FiChevronRight size={20} />
          </button>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <button style={thisMonthStyle}>This month</button>
          <button style={infoButtonStyle}>
            <FiInfo size={20} />
          </button>
        </div>
      </div>
      <div
        style={{
          ...calendarGridStyle,
          maxHeight: isCollapsed ? "0" : "800px",
          opacity: isCollapsed ? 0 : 1,
          overflow: "hidden",
          transition: "all 0.3s ease",
          marginTop: isCollapsed ? 0 : "24px",
        }}
      >
        <div style={weekdayHeaderStyle}>
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div style={daysGridStyle}>
          {daysInMonth.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayData = tradeMap[dateStr];
            const hasData = dayData && dayData.count > 0;
            const isProfitable = hasData && dayData.pnl > 0;

            return (
              <div
                key={dateStr}
                style={{
                  ...dayStyle,
                  ...(hasData
                    ? {
                        backgroundColor: isProfitable ? "#0D4A2C" : "#4A0D0D",
                        border:
                          "1px solid " + (isProfitable ? "#22C55E" : "#EF4444"),
                      }
                    : {}),
                }}
              >
                <div style={dayNumberStyle}>{format(day, "d")}</div>
                {hasData && (
                  <div style={dayContentStyle}>
                    <div style={iconStyle}>📝</div>
                    <div
                      style={{
                        ...pnlStyle,
                        color: isProfitable ? "#22C55E" : "#EF4444",
                      }}
                    >
                      ${Math.abs(dayData.pnl).toFixed(1)}
                    </div>
                    <div style={tradeCountStyle}>
                      {dayData.count} {dayData.count === 1 ? "trade" : "trades"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  border: "1px solid #2a2a2a",
  padding: "24px",
  marginBottom: "24px",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const collapseButtonStyle = {
  background: "none",
  border: "none",
  color: "#888",
  cursor: "pointer",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  transition: "all 0.2s",
  ":hover": {
    backgroundColor: "#2a2a2a",
    color: "#fff",
  },
};

const titleStyle = {
  margin: "0",
  fontSize: "20px",
  fontWeight: "500",
  color: "#fff",
};

const arrowButtonStyle = {
  background: "none",
  border: "none",
  color: "#888",
  cursor: "pointer",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  transition: "all 0.2s",
  ":hover": {
    backgroundColor: "#2a2a2a",
    color: "#fff",
  },
};

const thisMonthStyle = {
  padding: "8px 16px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: "8px",
  color: "#fff",
  cursor: "pointer",
};

const infoButtonStyle = {
  ...arrowButtonStyle,
};

const calendarGridStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const weekdayHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  textAlign: "center",
  color: "#888",
  fontSize: "14px",
  fontWeight: "500",
  padding: "8px 0",
};

const daysGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "8px",
};

const dayStyle = {
  aspectRatio: "1",
  backgroundColor: "#0A0A0A",
  borderRadius: "8px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #1a1a1a",
};

const dayNumberStyle = {
  fontSize: "14px",
  color: "#888",
  marginBottom: "8px",
};

const dayContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  flex: 1,
};

const iconStyle = {
  fontSize: "16px",
  marginBottom: "4px",
};

const pnlStyle = {
  fontSize: "16px",
  fontWeight: "500",
};

const tradeCountStyle = {
  fontSize: "12px",
  color: "#888",
};

export default TradeCalendar;
