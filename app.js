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

var uuid = require('node-uuid');

var socket_list = {};

var sock_uuid;

sock.bindSync('tcp://127.0.0.1:5000');
sock_recv.connect('tcp://127.0.0.1:5001');

sock_recv.on('message', function(msg){
  console.log(JSON.parse(msg));
  socket_list[JSON.parse(msg).socket_id].emit('message', JSON.parse(msg));
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
  sock_uuid = uuid.v1();
  socket_list[sock_uuid] = socket;
  console.log('@@@@@@@@@@@@@@@@@@@    ' + socket.id + '   @@@@@@@@@@@@@@@');
  socket.emit('message', {
    msg: 'Connected!',
    socket_id: sock_uuid,
  });
  socket.on('message', function(data) {
    sock.send(JSON.stringify(data));
    console.log(data);
  });
  socket.on('disconnect', function(socket) {
    for (var key in socket_list) {
      if ( socket_list[key] == socket ) {
        delete(socket_list[key]);
      }
    }
  });
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
