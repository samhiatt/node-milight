var dgram = require('dgram');

var commands = {
	white: {
		on0: [0x35, 0x00],
		off0: [0x39, 0x00],
		on1: [0x38, 0x00],
		off1: [0x3b, 0x00],
		on2: [0x3d, 0x00],
		off2: [0x33, 0x00],
		on3: [0x37, 0x00],
		off3: [0x3a, 0x00],
		on4: [0x32, 0x00],
		off4: [0x36, 0x00]
	},
	rgbw: {
		on0: [0x42, 0x00],
		off0: [0x41, 0x00],
		on1: [0x45, 0x00],
		off1: [0x46, 0x00],
		on2: [0x47, 0x00],
		off2: [0x48, 0x00],
		on3: [0x49, 0x00],
		off3: [0x4a, 0x00],
		on4: [0x4b, 0x00],
		off4: [0x4c, 0x00]
	}
};

var Controller = function(opts){
	this.host = opts.host || '10.10.10.100';
	this.port = opts.port || 8899;
	this.socket = dgram.createSocket('udp4');
	this.lights = opts.lights || 'rgbw';
	var self = this;
	this.allOn = function(cb){
		self.on(0,cb);
	};
	this.allOff = function(cb){
		self.off(0,cb);
	};
	this.on = function(group,cb){
		if (!group) group = 0;
		var command = (commands[self.lights]||{})['on'+group];
		if (command) self.send(command,cb);
		else cb(new Error("Command not found."));
	};
	this.off = function(group,cb){
		if (!group) group = 0;
		var command = (commands[self.lights]||{})['off'+group];
		if (command) self.send(command,cb);
		else cb(new Error("Command not found."));
	};
	this.send = function(cmd,cb){
		if (!cb) cb = function(err,res){
			if (err) throw err;
			console.log("UDP response",res);
		};
		var buffer = new Buffer(cmd.concat(0x55), 'hex');
		self.socket.send(
			buffer,
			0,
			buffer.length,
			self.port,
			self.host,
			cb
		);
	};
};

module.exports = function(opts,callback){
	return new Controller(opts,callback);
};