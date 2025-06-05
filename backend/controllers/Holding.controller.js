const {HoldingsModel} = require("../model/HoldingsModel");

module.exports.AllHoldings = async (req, res) => {
  try {
    let allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
  } catch (err) {
    res.status(500).send("Error fetching holdings");
  }
};

//holdings by userId
module.exports.HoldingsByUserId = async (req, res) => {
  const userId = req.query.userId;
  try {
    await HoldingsModel.updatePNL();
    const holdings = await HoldingsModel.find({ userId });
    const holdingsWithCalculatedValues = await Promise.all(
      holdings.map(async (holding) => {
        const { name, qty, avgPrice, Price, netChange, PNL } = holding;
        const currentValue = qty * Price;
        const netChangePercentage =
          netChange !== undefined && Price !== 0
            ? ((netChange / Price ) * 100).toFixed(2)
            : "N/A";
        return {
          name,
          qty,
          avgCost: avgPrice,
          ltp: Price,
          currentValue,
          pnl:PNL*qty,
          netChange: netChangePercentage,
        };
      })
    );

    return res.status(200).json(holdingsWithCalculatedValues);
  } catch (error) {
    console.error("Error fetching holdings:", error);
    return res.status(500).json({ message: "Failed to fetch holdings", error });
  }
}