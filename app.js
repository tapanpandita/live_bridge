/**
 * This project attempts to create a bridge between node.js and python applications
 */


/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

var zmq = require('zmq')
  , sock = zmq.socket('push');

sock.bindSync('tcp://127.0.0.1:5000');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
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

app.get('/', routes.index);

app.listen(3000);

io.sockets.on('connection', function (socket) {
  socket.emit('message', { msg: 'Connected' });
  socket.on('message', function (data) {
    sock.send(JSON.stringify(data));
    console.log(data);
    socket.emit('message', { msg: data.msg });
  });
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
