var express = require('express');
var redis = require('redis-url').createClient(process.env.REDISTOGO_URL);


var app = express.createServer(express.logger());

app.get('/', function(req, res) {
  redis.get('counter', function(err, counter) {
    console.log('counter is: ' + counter);
    // if (typeof(counter) == 'undefined') {

    counter = counter + 1;
    redis.set('counter', counter);
    res.send('Hello World! ' + counter);
  });
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
