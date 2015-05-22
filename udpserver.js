// Reference implementation from https://nodejs.org/api/dgram.html

var dgram = require("dgram");
var Promise = require('bluebird');

exports.createServer = function(cb){
	var server = dgram.createSocket("udp4");

	server.on("error", function (err) {
		console.error("server error:\n" + err.stack);
		server.close();
	});

	server.listenForMessage = function() {
		return new Promise(function (resolve, reject) {
			
			var getMsgArray = function(msg){
				var msgArr = [];
				for (var i=0; i<msg.length; i++){
					msgArr.push(msg[i]);
				}
				return msgArr;
			};
			
			server.once('message', function (msg, rinfo) {
				var msgArr = getMsgArray(msg);
				resolve(msgArr);
			});
			
			setTimeout(function () {
				reject(new Error("Timeout while listening for UDP message."));
			}, 1000);
			
		});
	};

	server.bind(8899);
	
	cb(null,server);
	return server;
};


