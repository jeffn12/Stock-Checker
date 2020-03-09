/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var needle = require("needle");
var StockHandler = require("../controllers/stockHandler");

module.exports = function(app, db) {
  var stockHandler = new StockHandler();
  app
    .route("/api/stock-prices")

    .get(async function(req, res) {
      var ip = req.headers["x-forwarded-for"];
      ip = ip ? ip.split(",")[0] : '0.0.0.0';
      var stockQuery = stockHandler.getStockQuery(req.query);
      //console.log("request received...");
      //console.log(`${ip} requesting: ${JSON.stringify(stockQuery)}`)
    
      var wasLiked =
        (await db
          .collection("likes")
          .findOne({ stockSymbol: stockQuery.stock_1.symbol, ip: ip })) === null
          ? false
          : true;

      var stockOne = (await needle("get", stockQuery.stock_1.url)).body;
      stockOne.likes = (await db
        .collection("likes")
        .findOneAndUpdate(
          { stockSymbol: stockQuery.stock_1.symbol },
          stockHandler.getUpdate(
            stockQuery.stock_1.symbol,
            req.query.like,
            wasLiked,
            ip
          ),
          { upsert: true, returnOriginal: false }
        )).value.likes;

      var stockData = {
        stockData: {
          stock: stockOne.symbol,
          price: stockOne.latestPrice,
          likes: stockOne.likes
        }
      };
      if (!stockQuery.stock_2) {
        res.send(stockData);
      } else if (stockQuery.stockCount === 2) {
        var stockTwo = (await needle("get", stockQuery.stock_2.url)).body;
        stockTwo.likes = (await db
          .collection("likes")
          .findOneAndUpdate(
            { stockSymbol: stockQuery.stock_2.symbol },
            stockHandler.getUpdate(
              stockQuery.stock_2.symbol,
              req.query.like,
              wasLiked,
              ip
            ),
            { upsert: true, returnOriginal: false }
          )).value.likes;
        stockData.stockData.rel_likes = stockOne.likes - stockTwo.likes;
        stockData.stockData = [
          stockData.stockData,
          {
            stock: stockTwo.symbol,
            price: stockTwo.latestPrice,
            likes: stockTwo.likes,
            rel_likes: stockTwo.likes - stockOne.likes
          }
        ];
        res.send(stockData);
      } else {
        res.send("Stock Retrieval Error");
      }
    });
};
