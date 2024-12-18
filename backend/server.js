const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const tradeRoutes = require("./routes/trades"); // Add trades routes
const auth = require("./middleware/auth");

// Load environment variables
dotenv.config();

const app = express();

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000", // Development
        "http://localhost:5173", // Vite Development
        "https://project-bishop-frontend.onrender.com", // Production
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Block unknown origins
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    credentials: true, // Allow cookies and headers
  })
);

// Middleware for parsing JSON
app.use(bodyParser.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error("Please define the MONGO_URI environment variable");
}

mongoose
  .connect(uri)
  .then(() => console.log("Successfully connected to MongoDB Atlas!"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/trades", tradeRoutes); // Trade routes

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Export the Express API
module.exports = app;

// Start the server if not imported
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
