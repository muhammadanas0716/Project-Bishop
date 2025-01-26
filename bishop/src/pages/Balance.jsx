import React, { useState, useEffect } from "react";
import { getAccountBalances } from "../services/tradierService";

const Balance = () => {
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const data = await getAccountBalances();
        setBalances(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch balance data");
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  if (loading) return <div className="p-4">Loading balances...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!balances) return <div className="p-4">No balance data available</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Account Balance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Equity</h2>
          <p className="text-2xl text-green-500">
            ${balances.total_equity?.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Option Buying Power</h2>
          <p className="text-2xl">
            ${balances.option_buying_power?.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Stock Buying Power</h2>
          <p className="text-2xl">${balances.stock_buying_power?.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Cash</h2>
          <p className="text-2xl">${balances.cash?.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Market Value</h2>
          <p className="text-2xl">${balances.market_value?.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Long Market Value</h2>
          <p className="text-2xl">${balances.long_market_value?.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default Balance;
