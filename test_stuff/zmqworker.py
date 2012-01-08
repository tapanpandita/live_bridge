import zmq
import simplejson

context = zmq.Context()
socket = context.socket(zmq.PULL)
socket.connect("tcp://127.0.0.1:5000")

while True:
    data = socket.recv()
    d = simplejson.loads(data)
    print d
