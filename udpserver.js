// Reference implementation from https://nodejs.org/api/dgram.html

var dgram = require("dgram");

exports.createServer = function(cb){
	var server = dgram.createSocket("udp4");

	server.on("error", function (err) {
		console.error("server error:\n" + err.stack);
		server.close();
	});

	server.bind(8899);
	
	cb(null,server);
	return server;
};


