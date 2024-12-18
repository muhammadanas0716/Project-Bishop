const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticker: {
      type: String,
      required: true,
    },
    optionType: {
      type: String,
      enum: ["Call", "Put"],
      required: true,
    },
    strike: {
      type: Number,
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    exitPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    expDate: {
      type: Date,
      required: true,
    },
    isZeroDTE: {
      type: Boolean,
      default: false,
    },
    pnl: {
      type: Number,
      required: true,
    },
    pnlPercent: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trade", tradeSchema);
