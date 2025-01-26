const mongoose = require("mongoose");
const Trade = require("../models/Trade");

// Mx3ongoDB connection string
const MONGODB_URI = "mongodb://localhost:27017/bishop";

// Sample trade data
const sampleTrades = [
  {
    ticker: "AAPL",
    optionTyxxpe: "Call",
    expDate: new Date("2024-03-15"),
    entryPrice: 3.45,
    exitPrice: 5.2,
    strike: 190,
    quantity: 2,
    link: "https://example.com/trade1",
    pnl: 350,
    pnlPercent: 50.72,
    isZeroDTE: true,
    createdAt: new Date("2024-03-01T10:30:00"),
  },
  {
    ticker: "TSLA",
    optionType: "Put",
    expDate: new Date("2024-03-16"),
    entryPrice: 4.2,
    exitPrice: 6.8,
    strike: 200,
    quantity: 3,
    link: "https://example.com/trade2",
    pnl: 780,
    pnlPercent: 61.9,
    isZeroDTE: true,
    createdAt: new Date("2024-03-02T11:15:00"),
  },
  {
    ticker: "NVDA",
    optionType: "Call",
    expDate: new Date("2024-03-17"),
    entryPrice: 5.6,
    exitPrice: 4.3,
    strike: 850,
    quantity: 1,
    link: "https://example.com/trade3",
    pnl: -130,
    pnlPercent: -23.21,
    isZeroDTE: true,
    createdAt: new Date("2024-03-03T14:20:00"),
  },
  {
    ticker: "META",
    optionType: "Call",
    expDate: new Date("2024-03-18"),
    entryPrice: 2.8,
    exitPrice: 4.5,
    strike: 480,
    quantity: 4,
    link: "https://example.com/trade4",
    pnl: 680,
    pnlPercent: 60.71,
    isZeroDTE: true,
    createdAt: new Date("2024-03-04T09:45:00"),
  },
  {
    ticker: "AMD",
    optionType: "Put",
    expDate: new Date("2024-03-19"),
    entryPrice: 3.9,
    exitPrice: 2.4,
    strike: 170,
    quantity: 2,
    link: "https://example.com/trade5",
    pnl: -300,
    pnlPercent: -38.46,
    isZeroDTE: true,
    createdAt: new Date("2024-03-05T13:10:00"),
  },
  {
    ticker: "MSFT",
    optionType: "Call",
    expDate: new Date("2024-03-20"),
    entryPrice: 4.1,
    exitPrice: 5.9,
    strike: 420,
    quantity: 3,
    link: "https://example.com/trade6",
    pnl: 540,
    pnlPercent: 43.9,
    isZeroDTE: true,
    createdAt: new Date("2024-03-06T15:30:00"),
  },
  {
    ticker: "GOOGL",
    optionType: "Put",
    expDate: new Date("2024-03-21"),
    entryPrice: 3.2,
    exitPrice: 2.1,
    strike: 140,
    quantity: 5,
    link: "https://example.com/trade7",
    pnl: -550,
    pnlPercent: -34.38,
    isZeroDTE: true,
    createdAt: new Date("2024-03-07T10:20:00"),
  },
  {
    ticker: "AMZN",
    optionType: "Call",
    expDate: new Date("2024-03-22"),
    entryPrice: 4.8,
    exitPrice: 7.2,
    strike: 180,
    quantity: 2,
    link: "https://example.com/trade8",
    pnl: 480,
    pnlPercent: 50.0,
    isZeroDTE: true,
    createdAt: new Date("2024-03-08T11:45:00"),
  },
  {
    ticker: "SPY",
    optionType: "Put",
    expDate: new Date("2024-03-23"),
    entryPrice: 2.9,
    exitPrice: 4.3,
    strike: 510,
    quantity: 4,
    link: "https://example.com/trade9",
    pnl: 560,
    pnlPercent: 48.28,
    isZeroDTE: true,
    createdAt: new Date("2024-03-09T14:15:00"),
  },
  {
    ticker: "QQQ",
    optionType: "Call",
    expDate: new Date("2024-03-24"),
    entryPrice: 3.7,
    exitPrice: 5.4,
    strike: 440,
    quantity: 3,
    link: "https://example.com/trade10",
    pnl: 510,
    pnlPercent: 45.95,
    isZeroDTE: true,
    createdAt: new Date("2024-03-10T12:30:00"),
  },
];

async function seedTrades() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing trades
    await Trade.deleteMany({});
    console.log("Cleared existing trades");

    // Insert sample trades
    const result = await Trade.insertMany(sampleTrades);
    console.log(`Successfully inserted ${result.length} trades`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding trades:", error);
    process.exit(1);
  }
}

// Run the seed function
seedTrades();
