const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");
const db = require("../db");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Get all trades
router.get("/", auth, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(trades);
  } catch (err) {
    console.error("Error fetching trades:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch trades", error: err.message });
  }
});

// Delete all trades (Hard Reset)
router.delete("/reset", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log("No user found in request:", req.user);
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log("Starting reset process for user:", req.user.id);

    // First verify the user has trades
    const tradeCount = await Trade.countDocuments({ userId: req.user.id });
    console.log("Current trade count for user:", tradeCount);

    // Check database connection
    console.log("Database connection state:", mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
      console.error(
        "Database not connected. Connection state:",
        mongoose.connection.readyState
      );
      return res.status(500).json({ message: "Database connection error" });
    }

    // Log the query we're about to execute
    console.log("Executing delete query:", { userId: req.user.id });

    try {
      const result = await Trade.deleteMany({ userId: req.user.id });
      console.log("Delete operation result:", result);

      if (!result) {
        console.error("Delete operation returned null result");
        return res
          .status(500)
          .json({ message: "Delete operation failed - null result" });
      }

      console.log("Reset successful. Deleted count:", result.deletedCount);

      // Verify deletion
      const remainingCount = await Trade.countDocuments({
        userId: req.user.id,
      });
      console.log("Remaining trades after deletion:", remainingCount);

      res.json({
        message: "All trades deleted successfully",
        deletedCount: result.deletedCount,
        previousCount: tradeCount,
        remainingCount,
      });
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return res.status(500).json({
        message: "Database operation failed",
        error: dbError.message,
        stack: dbError.stack,
      });
    }
  } catch (err) {
    console.error("Error in reset endpoint:", err);
    console.error("Full error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      message: "Failed to reset trades",
      error: err.message,
      details: err.stack,
    });
  }
});

// Add new trade
router.post("/", auth, async (req, res) => {
  try {
    const trade = new Trade({
      ...req.body,
      userId: req.user.id,
      pnl: req.body.exitPrice
        ? (req.body.exitPrice - req.body.entryPrice) * req.body.quantity * 100
        : 0,
      pnlPercent: req.body.exitPrice
        ? ((req.body.exitPrice - req.body.entryPrice) / req.body.entryPrice) *
          100
        : 0,
    });

    const newTrade = await trade.save();
    res.status(201).json(newTrade);
  } catch (err) {
    console.error("Error adding trade:", err);
    res
      .status(400)
      .json({ message: "Failed to add trade", error: err.message });
  }
});

// Update trade
router.put("/:id", auth, async (req, res) => {
  try {
    // First check if the trade belongs to the user
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    const updatedTrade = await Trade.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        userId: req.user.id, // Ensure userId cannot be changed
        pnl: req.body.exitPrice
          ? (req.body.exitPrice - req.body.entryPrice) * req.body.quantity * 100
          : 0,
        pnlPercent: req.body.exitPrice
          ? ((req.body.exitPrice - req.body.entryPrice) / req.body.entryPrice) *
            100
          : 0,
      },
      { new: true }
    );

    res.json(updatedTrade);
  } catch (err) {
    console.error("Error updating trade:", err);
    res
      .status(400)
      .json({ message: "Failed to update trade", error: err.message });
  }
});

// Delete single trade
router.delete("/:id", auth, async (req, res) => {
  try {
    // First check if the trade belongs to the user
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
    console.error("Error deleting trade:", err);
    res
      .status(500)
      .json({ message: "Failed to delete trade", error: err.message });
  }
});

router.post("/publish", auth, async (req, res) => {
  try {
    const {
      pair,
      entry_price,
      exit_price,
      position_size,
      trade_type,
      entry_date,
      exit_date,
      notes,
      strategy,
    } = req.body;

    // Calculate profit/loss
    const pnl =
      trade_type === "LONG"
        ? (exit_price - entry_price) * position_size
        : (entry_price - exit_price) * position_size;

    const pnl_percentage =
      trade_type === "LONG"
        ? ((exit_price - entry_price) / entry_price) * 100
        : ((entry_price - exit_price) / exit_price) * 100;

    // Create new trade using Mongoose model
    const trade = new Trade({
      userId: req.user.id,
      pair,
      entryPrice: entry_price,
      exitPrice: exit_price,
      positionSize: position_size,
      tradeType: trade_type,
      entryDate: entry_date,
      exitDate: exit_date,
      pnl,
      pnlPercentage: pnl_percentage,
      notes,
      strategy,
    });

    const savedTrade = await trade.save();

    res.json({
      success: true,
      message: "Trade published successfully",
      tradeId: savedTrade._id,
    });
  } catch (error) {
    console.error("Error publishing trade:", error);
    res.status(500).json({
      success: false,
      message: "Error publishing trade",
      error: error.message,
    });
  }
});

module.exports = router;
