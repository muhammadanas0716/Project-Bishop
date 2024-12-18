const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");
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
