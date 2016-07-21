var TCPSpy = require('./lib/tcpspy');
var colors = require('colors/safe');

if(!colors) console.log('Do "npm install https://github.com/grit96/colors.js" first.');

console.log(colors.red(' RED = client data'));
console.log(colors.blue('BLUE = server data'));


var httpProxy = new TCPSpy(9000, "google.com", 80, "HTTP Proxy");
httpProxy.on('clientData', function (clientData) {
	console.log(colors.red(clientData));
	console.log(colors.blue(clientData.toString()));
});
httpProxy.on('serverData', function (serverData) {
	console.log(colors.red(serverData));
	console.log(colors.blue(serverData.toString()));
});
httpProxy.start();

console.log('Now go to http://localhost:9000 to test this out!');