'use strict';

angular.module('stockDogApp')
  .service('QuoteService', function ($http, $interval) {
    var stocks = [];
    var BASE = 'http://query.yahooapis.com/v1/public/yql';

    var update = function (quotes) {
      console.log(quotes);
      // Ensure that the current quotes match registered stocks
      if (quotes.length === stocks.length) {
        _.each(quotes, function (quote, idx) {
          var stock = stocks[idx];
          stock.lastPrice = parseFloat(quote.l_fix);
          stock.change = quote.c_fix;
          stock.percentChange = quote.cp_fix;
          stock.marketValue = stock.shares * stock.lastPrice;
          stock.dayChange = stock.shares * parseFloat(stock.change);
          stock.save();
        });
      }
    };

    this.register = function (stock) {

      if (stocks.length > 0) {
        var ele = stocks.filter(function (item) {
          if (item.company == stock.company) {
            return true;
          }
        });

        if (!ele || ele.length==0) {
          stocks.push(stock);
        }
      }
      else {
        stocks.push(stock);
      }
    };

    this.deregister = function (stock) {
      _.remove(stocks, stock);
    };

    this.clear = function () {
      stocks = [];
    };

    this.fetch = function () {
      var symbols = _.reduce(stocks, function (symbols, stock) {
        symbols.push(stock.company.symbol);
        return symbols;
      }, []);
      
      // var query = encodeURIComponent('select * from yahoo.finance.quotes where symbol in (\'' + symbols.join(',') + '\')');
      // var url = BASE + '?' + 'q=' + query + '&format=json&diagnostics=true&env=http://datatables.org/alltables.env';

      var url = "http://www.google.com/finance/info?q=NSE:" + symbols.join(',');

      $http.jsonp(url + '&callback=JSON_CALLBACK')

        .success(function (data) {

          if (data) {
            var quotes = data;
            update(quotes);
          }
          
          // if (data.query) {
          //   if (data.query.count) {
          //     var quotes = data.query.count > 1 ? data.query.results.quote : [data.query.results.quote];
          //     update(quotes);
          //     console.log("Success: " + url);
          //   }
          //   else {
          //     console.log("Failure: " + url);
          //   }
          // }
          // else {
          //   console.log("Failure: " + url);
          // }
        })
        .error(function (data) {
          console.log(data);
        });
    };

    $interval(this.fetch, 5000);
  });
