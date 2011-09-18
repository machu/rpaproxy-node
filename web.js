
/**
 * Module dependencies.
 */

var express = require('express');
var redis = require('redis-url').createClient(process.env.REDISTOGO_URL);
var app = express.createServer(express.logger());
var Proxy = require('./models/proxy.js');

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

app.get('/', function(req, res) {
  var proxy = new Proxy();
  proxy.name = "test";
  proxy.locales = ["ja", "de", "en"]
  proxy.save();

  redis.get('counter', function(err, counter) {
    console.log('counter is: ' + counter);
    counter = counter + 1;
    redis.set('counter', counter);
    res.send('Hello World! ' + counter);
  });
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
