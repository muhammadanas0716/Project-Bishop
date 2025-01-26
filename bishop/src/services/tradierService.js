import axios from "axios";

const TRADIER_API_URL = process.env.REACT_APP_TRADIER_API_URL;
const ACCOUNT_ID = process.env.REACT_APP_TRADIER_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.REACT_APP_TRADIER_ACCESS_TOKEN;

if (!TRADIER_API_URL || !ACCOUNT_ID || !ACCESS_TOKEN) {
  throw new Error("Missing required Tradier API environment variables");
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
    console.error("Error fetching account balances:", error);
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
    console.error("Error fetching positions:", error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await tradierAxios.get(`/accounts/${ACCOUNT_ID}/orders`);
    return response.data.orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export default {
  getAccountBalances,
  getPositions,
  getOrders,
};
