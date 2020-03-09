module.exports = function() {
  this.getStockQuery = function(url) {
    var stockQuery = {
      stockCount: 0,
      stock_1: { url: "", symbol: "", like: false }
    };
    if (typeof url.stock === "string") {
      stockQuery.stock_1.url =
        "https://repeated-alpaca.glitch.me/v1/stock/" + url.stock + "/quote";
      stockQuery.stock_1.symbol = url.stock.toUpperCase();
      stockQuery.stock_1.like = url.like;
      stockQuery.stockCount = 1;
    } else if (typeof url.stock === "object") {
      stockQuery.stock_1.url =
        "https://repeated-alpaca.glitch.me/v1/stock/" + url.stock[0] + "/quote";
      stockQuery.stock_1.symbol = url.stock[0].toUpperCase();
      stockQuery.stock_1.like = url.like;
      stockQuery.stock_2 = {};
      stockQuery.stock_2.url =
        "https://repeated-alpaca.glitch.me/v1/stock/" + url.stock[1] + "/quote";
      stockQuery.stock_2.symbol = url.stock[1].toUpperCase();
      stockQuery.stock_2.like = url.like;
      stockQuery.stockCount = 2;
    }
    return stockQuery;
  };

  this.getUpdate = function(symbol, likeRequested, wasLiked, ip) { 
    var update = {};
    update["$set"] = {
      stockSymbol: symbol
    };
    if (!wasLiked && likeRequested) {
      update["$inc"] = { likes: 1 };
      update["$push"] = { ip: ip };
    }
    if (!update["$inc"]) update["$setOnInsert"] = { likes: 0 };
    if (!update["$push"]) update["$setOnInsert"].ip = [];
    return update;
  };
};
