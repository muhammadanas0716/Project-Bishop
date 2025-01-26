import React, { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiCreditCard,
  FiCheckCircle,
  FiTrendingUp,
} from "react-icons/fi";
import { getAccountBalances, getPositions } from "../services/tradierService";

const Trade = () => {
  const [accountData, setAccountData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balances, positionsData] = await Promise.all([
        getAccountBalances(),
        getPositions(),
      ]);

      setAccountData(balances);
      setPositions(positionsData?.position || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#141414] p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400">Total Equity</div>
              <div className="text-xl font-semibold">
                ${accountData?.total_equity?.toFixed(2) || "0.00"}
              </div>
            </div>
            <FiDollarSign className="text-green-500" size={20} />
          </div>
        </div>

        <div className="bg-[#141414] p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400">Available Cash</div>
              <div className="text-xl font-semibold">
                ${accountData?.cash?.cash_available?.toFixed(2) || "0.00"}
              </div>
            </div>
            <FiCreditCard className="text-blue-500" size={20} />
          </div>
        </div>

        <div className="bg-[#141414] p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400">Market Value</div>
              <div className="text-xl font-semibold">
                ${accountData?.market_value?.toFixed(2) || "0.00"}
              </div>
            </div>
            <FiTrendingUp className="text-yellow-500" size={20} />
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="bg-[#141414] p-4 rounded-lg">
        <h2 className="text-lg mb-4">Positions</h2>
        {positions.length === 0 ? (
          <div className="text-gray-400">No open positions</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Quantity</th>
                  <th className="pb-2">Cost Basis</th>
                  <th className="pb-2">Current Price</th>
                  <th className="pb-2">Market Value</th>
                  <th className="pb-2">P/L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position, index) => (
                  <tr key={index}>
                    <td className="py-2">{position.symbol}</td>
                    <td className="py-2">{position.quantity}</td>
                    <td className="py-2">${position.cost_basis}</td>
                    <td className="py-2">${position.last_price}</td>
                    <td className="py-2">${position.market_value}</td>
                    <td
                      className={
                        position.profit_loss >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      ${position.profit_loss}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Trade */}
      <div className="bg-[#141414] p-4 rounded-lg">
        <h2 className="text-lg mb-4">Quick Trade</h2>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Symbol"
            className="bg-[#1a1a1a] p-2 rounded"
          />
          <input
            type="number"
            placeholder="Quantity"
            className="bg-[#1a1a1a] p-2 rounded"
          />
          <select className="bg-[#1a1a1a] p-2 rounded">
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop</option>
          </select>
          <button type="submit" className="bg-green-500 text-black p-2 rounded">
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default Trade;
