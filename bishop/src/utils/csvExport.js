export const convertToCSV = (trades) => {
  // Define CSV headers
  const headers = [
    "Date",
    "Ticker",
    "Option Type",
    "Strike",
    "Entry Price",
    "Exit Price",
    "Quantity",
    "P&L",
    "P&L %",
    "Zero DTE",
    "Expiration Date",
    "Trade Link",
  ];

  // Convert trades to CSV rows
  const rows = trades.map((trade) => [
    new Date(trade.createdAt).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }),
    trade.ticker,
    trade.optionType,
    trade.strike,
    trade.entryPrice,
    trade.exitPrice,
    trade.quantity,
    trade.pnl,
    (trade.pnlPercent || 0).toFixed(2) + "%",
    trade.isZeroDTE ? "Yes" : "No",
    new Date(trade.expDate).toLocaleDateString(),
    trade.link,
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return csvContent;
};

export const downloadCSV = (trades) => {
  const csvContent = convertToCSV(trades);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, "trades.csv");
  } else {
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `trades_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
