const net = require('net');
const EventEmitter = require('events');

class TCPSpy extends EventEmitter {
  constructor(sourcePort, destinationIP, destinationPort, debugIdentifier) {
    super();

    if(typeof sourcePort === 'object') {
      var options = sourcePort;

      this.sourcePort      = options.sourcePort;
      this.destinationIP   = options.destinationIP;
      this.destinationPort = options.destinationPort;
      this.debugIdentifier = options.debugIdentifier;
    }else{
      this.sourcePort      = sourcePort;
      this.destinationIP   = destinationIP;
      this.destinationPort = destinationPort;
      this.debugIdentifier = debugIdentifier;
    }
  }

  start() {
    var proxyServer = net.createServer((_incomingSocket) => {
      var incomingSocket = _incomingSocket;
      var outgoingSocket = null;

      if(this.debugIdentifier) console.log(`[${incomingSocket.remoteAddress} - ${this.debugIdentifier}] incomingSocket connected. Building outgoingSocket...`);

      // pause socket while we estabslish a outgoingSocket:
      incomingSocket.pause();

      // create forwarding socket:
      var serverSocketOptions = {
        port: this.destinationPort,
        host: this.destinationIP
      };

      outgoingSocket = net.connect(serverSocketOptions, () => {
        if(this.debugIdentifier) console.log(`[${incomingSocket.remoteAddress} - ${this.debugIdentifier}] outgoingSocket connected.`);

        // resume accepting data-events:
        incomingSocket.resume();
      });

      // pass along server data to client:
      outgoingSocket.on('data', (serverData) => {
        if(this.debugIdentifier) console.log(`[${incomingSocket.remoteAddress} - ${this.debugIdentifier}] got ${serverData.length} bytes of serverData`);
        this.emit('serverData', serverData)

        // stuur serverData door naar de client:
        incomingSocket.write(serverData)
      });

      outgoingSocket.on('end', () => {
        if(this.debugIdentifier) console.log(`[${incomingSocket.remoteAddress} - ${this.debugIdentifier}] outgoingSocket ended.`);
        incomingSocket.end();
      });

      outgoingSocket.on('close', () => {
        if(this.debugIdentifier) console.log(`[${incomingSocket.remoteAddress} - ${this.debugIdentifier}] outgoingSocket closed.`);
      });

      outgoingSocket.on('error', (err) => {
        if(this.debugIdentifier) console.log(`[${incomingSocket.remoteAddress} - ${this.debugIdentifier}] outgoingSocket error: ${err.toString()}. Ending both sockets.`);
        incomingSocket.end();
        if(outgoingSocket) outgoingSocket.end();
      });





      incomingSocket.on('end', () => {
        if(this.debugIdentifier) console.log(`[${incomingSocket.remoteAddress} - ${this.debugIdentifier}] incomingSocket ended.`);
        if(outgoingSocket) outgoingSocket.end();
      });

      incomingSocket.on('close', () => {
        if(this.debugIdentifier) console.log(`[${incomingSocket.remoteAddress} - ${this.debugIdentifier}] incomingSocket closed.`);
      });

      incomingSocket.on('error', (err) => {
        if(this.debugIdentifier) console.log(`[${incomingSocket.remoteAddress} - ${this.debugIdentifier}] incomingSocket error: ${err.toString()}. Ending both sockets.`);
        incomingSocket.end();
        if(outgoingSocket) outgoingSocket.end();
      });


      incomingSocket.on('data', (clientData) => {
        if(this.debugIdentifier) console.log(`[${incomingSocket.remoteAddress} - ${this.debugIdentifier}] got ${clientData.length} bytes of clientData`);
        this.emit('clientData', clientData);

        // pass along data to outgoingSocket:
        outgoingSocket.write(clientData);
      });
    });

    proxyServer.on('listening', () => {
      if(this.debugIdentifier) console.log(`[${this.debugIdentifier}] TCP Spy listening on ${proxyServer.address().address}:${proxyServer.address().port}`);
    });

    proxyServer.on('error', (err) => {
      if(this.debugIdentifier) console.log(`[${this.debugIdentifier}] TCP Spy Error: ${err.toString()}`);
    });

    proxyServer.listen(this.sourcePort);
  }
}

module.exports = TCPSpy;


