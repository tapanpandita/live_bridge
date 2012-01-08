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
  , sock = zmq.socket('push')
  , sock_recv = zmq.socket('pull');

var socket_list = [];

sock.bindSync('tcp://127.0.0.1:5000');
sock_recv.connect('tcp://127.0.0.1:5001');

sock_recv.on('message', function(msg){
  console.log(JSON.parse(msg));
  for (var i=0; i < socket_list.length; i++) {
    socket_list[i].emit('message', JSON.parse(msg));
  }
});

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

io.sockets.on('connection', function(socket) {
  socket.emit('message', { msg: 'Connected!'});
  socket_list.push(socket);
  socket.on('message', function(data) {
    sock.send(JSON.stringify(data));
    console.log(data);
    for (var i=0; i < socket_list.length; i++) {
      socket_list[i].emit('message', data);
    }
  });
  socket.on('disconnect', function(socket) {
    socket_list = socket_list.splice(socket);
  });
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
