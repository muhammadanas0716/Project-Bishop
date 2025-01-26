import React, { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { getAccountBalances } from "../services/tradierService";

const Trade = () => {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const balances = await getAccountBalances();
      setAccountData({
        totalValue: balances.total_equity,
        availableFunds:
          balances.cash?.cash_available || balances.option_buying_power,
        settledFunds:
          balances.total_cash - (balances.cash?.unsettled_funds || 0),
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching account data:", err);
      setError("Failed to load account data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const balanceCards = [
    {
      label: "Total Value",
      value: accountData?.totalValue || 0,
      icon: <FiDollarSign size={24} />,
      color: "#22C55E",
    },
    {
      label: "Available Funds",
      value: accountData?.availableFunds || 0,
      icon: <FiCreditCard size={24} />,
      color: "#3B82F6",
    },
    {
      label: "Settled Funds",
      value: accountData?.settledFunds || 0,
      icon: <FiCheckCircle size={24} />,
      color: "#8B5CF6",
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">Loading account data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-center">
          <FiAlertCircle className="text-red-500 mr-3" size={24} />
          <span className="text-red-500">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-white">Trade</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {balanceCards.map((card, index) => (
          <div
            key={index}
            className="bg-[#141414] rounded-xl p-6 border border-[#2a2a2a]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">{card.label}</span>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <div style={{ color: card.color }}>{card.icon}</div>
              </div>
            </div>
            <div className="text-2xl font-semibold text-white">
              $
              {card.value.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="bg-[#141414] rounded-xl p-6 border border-[#2a2a2a]">
          <h2 className="text-lg font-semibold mb-4 text-white">Place Order</h2>
          {/* Order form will go here */}
          <div className="text-gray-400 text-sm">Order form coming soon...</div>
        </div>

        {/* Positions */}
        <div className="bg-[#141414] rounded-xl p-6 border border-[#2a2a2a] lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-white">Positions</h2>
          {/* Positions table will go here */}
          <div className="text-gray-400 text-sm">
            Positions table coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
