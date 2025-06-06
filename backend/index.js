require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const passport=require("passport")
const LocalStrategy= require("passport-local")
const session=require('express-session')
const request = require('request');
const fs = require('fs');
const DB=require('./Database/db')
const UserRoutes=require('./Routes/user.routes');
const OrderRoutes=require('./Routes/order.routes');
const HoldingRoutes=require('./Routes/Holding.routes');
const User = require('./model/userModel'); // Assuming you have a User model defined in schema/UserSchema.js
// const { auth } = require('express-openid-connect');
// const { requiresAuth } = require('express-openid-connect');



const port = process.env.PORT || 3002;
const app = express();

app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true, 
}));
app.use(bodyParser.json());

app.use(session({
  secret: "mysecretcode",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: 'none', // Required for cross-origin cookies
    secure: false, // Set to true if using HTTPS
  },
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((user, done) => {
  done(null, user._id); // Save user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Retrieve user from the database
    done(null, user); // Attach user to req.user
  } catch (err) {
    done(err);
  }
});
DB();

app.use('/user',UserRoutes);
app.use('/order',OrderRoutes);
app.use('/holding',HoldingRoutes);
// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: 'a long, randomly-generated string stored in env',
//   baseURL: 'http://localhost:3000',
//   clientID: 'IoXqLZFvPyHgPcbU4iNdBptz9QraYLt9',
//   issuerBaseURL: 'https://dev-a5b3ioc2bbcsnbu6.us.auth0.com'
// };
// app.use(auth(config));



  
  
const companies = ['IBM', 'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NFLX', 'META', 'NVDA', 'JPM'];
const stockData = [];
async function fetchAndSaveData() {
    try {
        for (const symbol of companies) {
            await new Promise((resolve, reject) => {
                const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

                request.get({ url: apiUrl, json: true }, (err, response, data) => {
                    if (err) {
                        console.error(`Error fetching data for ${symbol}:`, err);
                        reject(err);
                    } else if (response.statusCode !== 200) {
                        console.error(`API error for ${symbol}:`, response.statusCode);
                        reject(new Error('API error'));
                    } else {
                        stockData.push({ symbol, data });
                        resolve();
                    }
                });
            });
        }
        const formattedData = `const stockData = ${JSON.stringify(stockData, null, 2)};\n\nmodule.exports = stockData;`;
        fs.writeFile('./data/data.js', formattedData, (err) => {
          if (err) {
              console.error('Error writing to data.js:', err);
          } else {
              console.log('Data successfully saved to data.js');
          }
      });
        fs.writeFile('../dashboard/src/data/data.js', formattedData, (err) => {
            if (err) {
                console.error('Error writing to data.js:', err);
            } else {
                console.log('Data successfully saved to data.js');
            }
        });
    } catch (err) {
        console.error('Failed to fetch or save data:', err);
    }
}
// fetchAndSaveData();
app.get('/api/stocks', (req, res) => {
  res.json(stockData); 
});
app.listen(port, () => {
  console.log("Server started at port:", port);
});
