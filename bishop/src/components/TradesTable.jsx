import React, { useState } from "react";
import { FiPlus, FiChevronDown, FiDownload, FiTrash2 } from "react-icons/fi";
import AddTradeModal from "./AddTradeModal";
import { format, parseISO, isValid } from "date-fns";
import { downloadCSV } from "../utils/csvExport";

const SectionTitle = ({ title }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: "32px 0 16px",
    }}
  >
    <h2
      style={{
        fontSize: "16px",
        fontWeight: "500",
        color: "#888",
        margin: 0,
      }}
    >
      {title}
    </h2>
    <div
      style={{
        flex: 1,
        height: "1px",
        backgroundColor: "#2a2a2a",
      }}
    />
  </div>
);

const TradesTable = ({ trades, onAddTrade, onDeleteTrade, onUpdateTrade }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTrade, setExpandedTrade] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const handleAddTrade = async (newTrade) => {
    const success = await onAddTrade(newTrade);
    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedTrades = [...trades].sort((a, b) => {
    if (sortConfig.direction === "asc") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const formatDate = (dateString) => {
    if (!dateString) {
      console.log("No date string provided");
      return "-";
    }
    try {
      console.log("Formatting date:", dateString);
      const date = parseISO(dateString);
      if (!isValid(date)) {
        console.log("Invalid date:", dateString);
        return "-";
      }
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  const formatPercent = (number) => {
    return Number(number).toFixed(2) + "%";
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          minWidth: "800px",
        }}
      >
        <SectionTitle title="Recent Trades" />
        <div className="flex gap-4">
          <button onClick={() => downloadCSV(trades)} className="btn-export">
            <FiDownload className="w-4 h-4" />
            Export Trades
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
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
            }}
          >
            <FiPlus size={16} />
            Add Trade
          </button>
        </div>
      </div>

      <div style={tableContainerStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a1a1a" }}>
              <th style={headerStyle} onClick={() => handleSort("createdAt")}>
                Date
              </th>
              <th style={headerStyle} onClick={() => handleSort("ticker")}>
                Ticker
              </th>
              <th style={headerStyle} onClick={() => handleSort("optionType")}>
                Type
              </th>
              <th style={headerStyle} onClick={() => handleSort("strike")}>
                Strike
              </th>
              <th style={headerStyle} onClick={() => handleSort("entryPrice")}>
                Entry
              </th>
              <th style={headerStyle} onClick={() => handleSort("exitPrice")}>
                Exit
              </th>
              <th style={headerStyle} onClick={() => handleSort("quantity")}>
                Qty
              </th>
              <th style={headerStyle} onClick={() => handleSort("pnl")}>
                P&L
              </th>
              <th style={headerStyle} onClick={() => handleSort("pnlPercent")}>
                P&L %
              </th>
              <th style={headerStyle} onClick={() => handleSort("expDate")}>
                Exp Date
              </th>
              <th style={headerStyle}>Link</th>
              <th style={headerStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade, index) => (
              <tr key={index} style={rowStyle(index === expandedTrade)}>
                <td style={cellStyle}>{formatDate(trade.createdAt)}</td>
                <td style={cellStyle}>{trade.ticker}</td>
                <td style={cellStyle}>{trade.optionType}</td>
                <td style={cellStyle}>${trade.strike}</td>
                <td style={cellStyle}>${trade.entryPrice}</td>
                <td style={cellStyle}>${trade.exitPrice}</td>
                <td style={cellStyle}>{trade.quantity}</td>
                <td style={pnlStyle(trade.pnl)}>
                  ${Number(trade.pnl).toFixed(2)}
                </td>
                <td style={pnlStyle(trade.pnlPercent)}>
                  {formatPercent(trade.pnlPercent)}
                </td>
                <td style={cellStyle}>{formatDate(trade.expDate)}</td>
                <td style={cellStyle}>
                  <a
                    href={trade.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkStyle}
                  >
                    View
                  </a>
                </td>
                <td style={cellStyle}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this trade?"
                          )
                        ) {
                          onDeleteTrade(trade._id);
                        }
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "4px",
                        cursor: "pointer",
                        color: "#EF4444",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "4px",
                      }}
                      className="hover:bg-red-500/10"
                    >
                      <FiTrash2 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setExpandedTrade(index === expandedTrade ? null : index)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        padding: "4px",
                        cursor: "pointer",
                        color: "#888",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "4px",
                      }}
                      className="hover:bg-white/5 hover:text-white"
                    >
                      <FiChevronDown
                        size={16}
                        style={{
                          transform:
                            expandedTrade === index ? "rotate(180deg)" : "",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTrade={handleAddTrade}
      />
    </div>
  );
};

// Styles
const tableContainerStyle = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  border: "1px solid #2a2a2a",
  overflow: "hidden",
  minWidth: "800px",
};

const headerStyle = {
  padding: "16px",
  textAlign: "left",
  color: "#888",
  fontWeight: "500",
  fontSize: "13px",
};

const cellStyle = {
  padding: "16px",
  color: "#fff",
  fontSize: "14px",
};

const pnlStyle = (value) => ({
  ...cellStyle,
  color: value >= 0 ? "#22C55E" : "#EF4444",
});

const linkStyle = {
  color: "#888",
  textDecoration: "none",
  transition: "color 0.2s ease",
  ":hover": {
    color: "#fff",
  },
};

const rowStyle = (isExpanded) => ({
  borderBottom: "1px solid #2a2a2a",
  backgroundColor: isExpanded ? "#1a1a1a" : "transparent",
});

export default TradesTable;
