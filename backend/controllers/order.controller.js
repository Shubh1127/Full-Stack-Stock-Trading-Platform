const data=require('../data/data');
const { HoldingsModel } = require('../model/HoldingsModel');
const { OrdersModel } = require('../model/OrdersModel')
async function getPreviousClose(stockName) {
  const stock = data.find(item => item.symbol === stockName);
  if (stock) {
    const dateList = Object.keys(stock.data['Time Series (Daily)']);
    const previousDate = dateList[1]; 
    if (previousDate) {
      const value=parseFloat(stock.data['Time Series (Daily)'][previousDate]['4. close']); 
      return value;
    } else {
      console.log(`No previous closing price found for stock ${stockName}`);
      return null;
    }
  } else {
    console.log(`Stock ${stockName} not found in data`);
    return null; 
  }
}

module.exports.buyStock=async(req,res)=>{
      const { userId, name, qty, price } = req.body;
      try {
        const quantity = Number(qty); 
        if (isNaN(quantity) || quantity <= 0) {
          return res.status(400).json({ message: "Invalid quantity" });
        }
        const previousClose = await getPreviousClose(name);
        if (previousClose === null) {
          return res.status(400).json({ message: `Previous close data not found for ${name}` });
        }
        // Calculate netChange as LTP - previous close
        const netChange = price - previousClose;
        let holding = await HoldingsModel.findOne({ userId, name });
        if (holding) {
          const totalCost = (holding.avgPrice * holding.qty) + (price * quantity); 
          const newQty = holding.qty + quantity; 
          const newAvgPrice = totalCost / newQty; 
          const newPrice = price;
    
          holding.qty = newQty;
          holding.avgPrice = newAvgPrice; 
          holding.Price = newPrice;
          holding.netChange = netChange;
          holding.updatedAt = new Date(); 
          await holding.save();
        } else {
          const newHolding = new HoldingsModel({
            userId,
            name,
            qty: quantity, 
            avgPrice: price,
            Price: price,
            netChange: netChange,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          await newHolding.save();
        }
        const newOrder = new OrdersModel({
          userId,
          name,
          qty: quantity,
          price,
          mode: "BUY",
        });
        await newOrder.save();
        return res.status(200).json({ message: "Stock bought successfully!" });
      } catch (error) {
        console.error("Error buying stock:", error);
        return res.status(500).json({ message: "Failed to buy stock", error });
      }
    };
module.exports.sellStock=async(req,res)=>{
  const { userId, name, qty, price } = req.body;

  try {
    const holding = await HoldingsModel.findOne({ userId, name });

    if (!holding || holding.qty < qty) {
      return res.status(400).json({
        message: "Insufficient quantity to sell.",
      });
    }

    // Create new sell order
    const newOrder = new OrdersModel({
      userId,
      name,
      qty,
      price,
      mode: "SELL",
    });

    await newOrder.save(); 

    // Update the holding quantity
    holding.qty -= qty;
    holding.netWorth = holding.qty * holding.avgPrice;

    if (holding.qty === 0) {
      await holding.deleteOne();
    } else {
      await holding.save();
    }

    return res.status(200).json({
      message: "Stock sold successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error selling stock:", error);
    return res.status(500).json({ message: "Failed to sell stock", error });
  }
}

module.exports.AllOrdersbyUserId=async(req,res)=>{
  const userId = req.query.userId;
  try {
    let allOrders;
    if (userId) {
      allOrders = await OrdersModel.find({ userId })
        .populate('userId')
        .sort({ createdAt: -1 }); // Sort by createdAt, latest first
    } else {
      allOrders = await OrdersModel.find({})
        .populate('userId')
        .sort({ createdAt: -1 }); // Sort by createdAt, latest first
    }
    // Return the orders with user data
    res.json(allOrders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Error fetching orders");
  }
}

module.exports.sellStockByOrderId = async (req, res) => {
     try {
    let BuyOrders = await OrdersModel.find({ mode: 'BUY' }).populate('userId');
    if (!BuyOrders || BuyOrders.length === 0) {
      return res.status(404).json({ message: 'No buy orders found' });
    }
    return res.status(200).json(BuyOrders);
  } catch (err) {
    console.error("Error fetching buy orders:", err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports.AllPositions = async (req, res) => {
    try {
    let allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
  } catch (err) {
    res.status(500).send("Error fetching holdings");
  }}