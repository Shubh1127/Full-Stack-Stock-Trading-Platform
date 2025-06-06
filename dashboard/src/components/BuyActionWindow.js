import React, { useState, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext"; 
import "./BuyActionWindow.css";
import { UserContext } from "./UserContext";

const BuyActionWindow = ({ uid, stockPrice, stockName }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [pricevalue,setPricevalue]=useState(stockPrice)
  const { closeBuyWindow } = useContext(GeneralContext);
  const {user} =useContext(UserContext)
  // console.log("buy window user:",user)
  // console.log(user._id)

  const handleBuyClick = () => {

    axios.post("http://localhost:3002/order/buystock", {
      name: stockName, 
      qty: stockQuantity,
      price: pricevalue,
      userId: user._id,
    },{
      withCredentials: true, // Include credentials for CORS
    });

    closeBuyWindow(); 
  };

  const handleCancelClick = () => {
    closeBuyWindow(); 
  };
  const handleQtyChange=(event)=>{
    setStockQuantity(event.target.value);
  }
  const handlePriceChange=(event)=>{
    setPricevalue(event.target.value);
  }

  return (
    <div className="container" id="buy-window" draggable="true">
      <h2>Buying {stockName}</h2> 
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={handleQtyChange}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              value={stockPrice*stockQuantity} 
              onChange={handlePriceChange}
              readOnly 
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹140.65</span>
        <div>
          <button className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </button>
          <button className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
