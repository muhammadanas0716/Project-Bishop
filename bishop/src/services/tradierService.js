import axios from "axios";

const TRADIER_API_URL = import.meta.env.VITE_TRADIER_API_URL;
const ACCOUNT_ID = import.meta.env.VITE_TRADIER_ACCOUNT_ID;
const ACCESS_TOKEN = import.meta.env.VITE_TRADIER_ACCESS_TOKEN;

// Debug logging
console.log("API URL:", TRADIER_API_URL);
console.log("Account ID:", ACCOUNT_ID);
console.log("Token exists:", !!ACCESS_TOKEN);

if (!TRADIER_API_URL || !ACCOUNT_ID || !ACCESS_TOKEN) {
  const missing = [];
  if (!TRADIER_API_URL) missing.push("VITE_TRADIER_API_URL");
  if (!ACCOUNT_ID) missing.push("VITE_TRADIER_ACCOUNT_ID");
  if (!ACCESS_TOKEN) missing.push("VITE_TRADIER_ACCESS_TOKEN");
  throw new Error(
    `Missing required Tradier API environment variables: ${missing.join(", ")}`
  );
}

const tradierAxios = axios.create({
  baseURL: TRADIER_API_URL,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    Accept: "application/json",
  },
});

export const getAccountBalances = async () => {
  try {
    const response = await tradierAxios.get(`/accounts/${ACCOUNT_ID}/balances`);
    return response.data.balances;
  } catch (error) {
    console.error("Error fetching account balances:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
    });
    throw error;
  }
};

export const getPositions = async () => {
  try {
    const response = await tradierAxios.get(
      `/accounts/${ACCOUNT_ID}/positions`
    );
    return response.data.positions;
  } catch (error) {
    console.error("Error fetching positions:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
    });
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await tradierAxios.get(`/accounts/${ACCOUNT_ID}/orders`);
    return response.data.orders;
  } catch (error) {
    console.error("Error fetching orders:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
    });
    throw error;
  }
};

export default {
  getAccountBalances,
  getPositions,
  getOrders,
};
