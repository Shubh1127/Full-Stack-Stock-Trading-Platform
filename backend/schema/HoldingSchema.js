const { Schema, default: mongoose } = require("mongoose");
const stockData = require("../data/data"); // Assuming data.js contains the stock data structure

// Define the Holdings Schema
const HoldingsSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, default: 0 },
    avgPrice: { type: Number, required: true, default: 0 },
    Price: { type: Number, required: true, default: 0 },
    netChange: { type: Number, default: 0 },
    PNL: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Static method to update PNL
HoldingsSchema.statics.updatePNL = async function () {
  const holdings = await this.find();

  for (const holding of holdings) {
    // Find stock data for the current holding
    const stock = stockData.find((entry) => entry.symbol === holding.name);
    if (stock) {
      const timeSeries = stock.data["Time Series (Daily)"];
      const latestDate = Object.keys(timeSeries).sort().pop(); // Get the latest date
      const latestClose = parseFloat(timeSeries[latestDate]["4. close"]); // Latest close price

      holding.PNL = latestClose - holding.Price; // Calculate PNL
      await holding.save(); // Save updated holding
    }
  }
};

module.exports = { HoldingsSchema };
