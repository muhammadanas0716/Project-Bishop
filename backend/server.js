const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const auth = require("./middleware/auth");
const Trade = require("./models/Trade");

// Load environment variables
dotenv.config();

const app = express();

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000", // For development
        "http://localhost:5173", // For development (Vite)
        "https://project-bishop-frontend.onrender.com", // Production frontend
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Reject other origins
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    credentials: true, // Allow credentials (e.g., cookies, headers)
  })
);

// Middleware for parsing JSON
app.use(bodyParser.json());

// MongoDB Connection URI
const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Please define the MONGO_URI environment variable");
}

// Connect to MongoDB using Mongoose
mongoose
  .connect(uri)
  .then(() => console.log("Successfully connected to MongoDB Atlas!"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);

// Health check route (public)
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Protected routes
app.get("/api/trades", auth, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(trades);
  } catch (err) {
    console.error("Error fetching trades:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/trades", auth, async (req, res) => {
  try {
    const tradeData = {
      ...req.body,
      userId: req.user.id,
    };

    const trade = new Trade(tradeData);
    const savedTrade = await trade.save();
    res.status(201).json(savedTrade);
  } catch (err) {
    console.error("Error adding trade:", err);
    res.status(400).json({
      message: "Failed to add trade",
      error: err.message,
    });
  }
});

app.put("/api/trades/:id", auth, async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    const updatedTrade = await Trade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTrade);
  } catch (err) {
    res.status(400).json({
      message: "Failed to update trade",
      error: err.message,
    });
  }
});

app.delete("/api/trades/:id", auth, async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    await Trade.findByIdAndDelete(req.params.id);
    res.json({ message: "Trade deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete trade",
      error: err.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Export the Express API
module.exports = app;

// Only listen if we're running directly (not being imported)
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
