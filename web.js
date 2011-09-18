
/**
 * Module dependencies.
 */

var express = require('express');
var redis = require('redis-url').createClient(process.env.REDISTOGO_URL);
var app = express.createServer(express.logger());
var Proxy = require('./models/proxy.js');
var async = require('async');
var http = require('http');
var url = require('url');
var util = require('util');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.param('locale', function(req, res, next, locale) {
  if (/^[a-z]{2}$/.test(locale)) {
    req.locale = locale;
    req.query = url.parse(req.url).query;
    next();
  } else {
    res.send("Bad Request", 400);
  }
});

app.get('/rpaproxy/:locale', function(req, res) {
  // TODO: 適切なラウンドロビン
  Proxy
    .find({ locales: req.locale })
    .run(function(err, proxies) {
      if (err) {
        return res.send("Error", 500);
      }
      // proxy実行＆チェック＆成功・失敗記録
      async.until(
        // ループ継続判定
        function() {
          console.log("check");
          return (proxies.length == 0 || res.statusCode == 302);
        },
        // ループ処理
        function(callback) {
          console.log("do");
          var proxy = proxies.shift();
          var endpoint = url.parse(proxy.endpoint);
          var options = {
            host: endpoint.host,
            port: endpoint.port || 80,
            path: endpoint.pathname + req.locale + '/?' + req.query
          };
          console.log("connecting to: " + options.host + options.path);
          http.get(options, function(proxy_res) {
            if (proxy_res.headers.location && proxy_res.statusCode == 302) {
              // レスポンスヘッダ設定
              res.statusCode = 302;
              res.setHeader('location', proxy_res.headers.location);
              // TODO: 成功回数を増分（非同期処理）
            } else {
              // TODO: 失敗回数を増分（非同期処理）
            }
            callback();
          }).on('error', function(err) {
            console.log("http proxy error: ");
            console.log(util.inspect(err));
            // TODO: 失敗回数を増分
            callback();
          });
        },
        // 後処理
        function(err) {
          if (err) {
            // 例外処理
            console.log(util.inspect(err));
            return res.send(err.message, 500);
          }
          if (res.statusCode != 302) {
            return res.send("not found available proxy", 503)
          }
          // 正常終了
          console.log("finished");
          res.statusCode = 200; // for debug
          res.send(res.getHeader('location')); // for debug
        }
      );
    });
});

app.get('/create_proxy', function(req, res) {
  var proxy = new Proxy();
  proxy.name = "test";
  proxy.endpoint = "http://www.machu.jp/amazon_proxy/";
  proxy.locales = ["ja", "de", "en"];
  proxy.save();
  res.send("create proxy");

  /*
  redis.get('counter', function(err, counter) {
    console.log('counter is: ' + counter);
    counter = counter + 1;
    redis.set('counter', counter);
    res.send('Hello World! ' + counter);
  });
  */
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
