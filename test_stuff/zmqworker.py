import zmq
import simplejson

context = zmq.Context()
socket = context.socket(zmq.PULL)
socket.connect("tcp://127.0.0.1:5000")
socket_push = context.socket(zmq.PUSH)
socket_push.bind("tcp://127.0.0.1:5001")

while True:
    data = socket.recv()
    d = simplejson.loads(data)
    socket_push.send(simplejson.dumps({'msg': 'received'}))
    print d
