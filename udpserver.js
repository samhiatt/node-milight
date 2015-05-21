// Reference implementation from https://nodejs.org/api/dgram.html

var dgram = require("dgram");

exports.createServer = function(cb){
	var server = dgram.createSocket("udp4");

	server.on("error", function (err) {
		console.log("server error:\n" + err.stack);
		server.close();
	});

	server.on("message", function (msg, rinfo) {
		var msgArr = [];
		for (var i=0; i<msg.length; i++){
			msgArr.push(msg[i]);
		}
		console.log("server got: " + msgArr + " from " +
		rinfo.address + ":" + rinfo.port);
	});

	server.on("listening", function () {
		var address = server.address();
		console.log("\nserver listening " +
		address.address + ":" + address.port);
	});

	server.bind(8899);
	
	cb(null,server);
	return server;
	
};


