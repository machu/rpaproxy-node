var express = require('express');
// console.log(process.env);
// var redis = require('redis-url').connect(process.env.REDISTOGO_URL);
var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

redis.get('counter', function(err, value) {
  console.log('counter is: ' + value);
  counter = counter + 1;
  redis.set('counter', counter);
});

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send('Hello World!');
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
