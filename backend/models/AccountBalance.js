const mongoose = require("mongoose");

const balanceHistorySchema = new mongoose.Schema({
  balance: {
    type: Number,
    required: true,
  },
  change: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    enum: ["TRADE", "DEPOSIT", "WITHDRAWAL", "ADJUSTMENT"],
    required: true,
  },
  tradeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trade",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const accountBalanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentBalance: {
      type: Number,
      required: true,
    },
    startingBalance: {
      type: Number,
      required: true,
      default: 13791.97,
    },
    balanceHistory: [balanceHistorySchema],
    riskSettings: {
      maxPositionSize: {
        type: Number,
        default: 0.02, // 2% of account by default
      },
      maxDailyLoss: {
        type: Number,
        default: 0.05, // 5% of account by default
      },
      maxDrawdown: {
        type: Number,
        default: 0.1, // 10% of account by default
      },
      notificationThresholds: {
        gain: {
          type: Number,
          default: 0.02, // Notify on 2% gain
        },
        loss: {
          type: Number,
          default: 0.02, // Notify on 2% loss
        },
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Method to add balance history entry
accountBalanceSchema.methods.addBalanceChange = async function (
  change,
  reason,
  tradeId = null
) {
  const newBalance = this.currentBalance + change;

  this.balanceHistory.push({
    balance: newBalance,
    change: change,
    reason: reason,
    tradeId: tradeId,
  });

  this.currentBalance = newBalance;
  this.lastUpdated = Date.now();

  return this.save();
};

// Method to check if notification should be triggered
accountBalanceSchema.methods.shouldNotify = function (change) {
  const changePercent = Math.abs(change / this.currentBalance);
  const thresholds = this.riskSettings.notificationThresholds;

  return {
    shouldNotify:
      changePercent >= (change > 0 ? thresholds.gain : thresholds.loss),
    type: change > 0 ? "gain" : "loss",
    percentage: changePercent * 100,
  };
};

// Method to get position size recommendations
accountBalanceSchema.methods.getPositionSizeRecommendation = function (
  riskLevel = "normal"
) {
  const riskMultipliers = {
    conservative: 0.5,
    normal: 1,
    aggressive: 1.5,
  };

  const baseSize = this.currentBalance * this.riskSettings.maxPositionSize;
  const multiplier = riskMultipliers[riskLevel] || 1;

  return {
    maxPosition: baseSize * multiplier,
    recommended: baseSize * multiplier * 0.75, // 75% of max as recommended
    conservative: baseSize * multiplier * 0.5, // 50% of max as conservative
  };
};

module.exports = mongoose.model("AccountBalance", accountBalanceSchema);
