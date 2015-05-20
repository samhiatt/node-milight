var dgram = require('dgram');

var commands = {
	/*
	 LimitlessLED White
	 ------------------
	 35 00 55 - All On
	 39 00 55 - All Off
	 3C 00 55 - Brightness Up
	 34 00 55 - Brightness Down (There are ten steps between min and max)
	 3E 00 55 - Warmer
	 3F 00 55 - Cooler (There are ten steps between warmest and coolest)
	 38 00 55 - Zone 1 On
	 3B 00 55 - Zone 1 Off
	 3D 00 55 - Zone 2 On
	 33 00 55 - Zone 2 Off
	 37 00 55 - Zone 3 On
	 3A 00 55 - Zone 3 Off
	 32 00 55 - Zone 4 On
	 36 00 55 - Zone 4 Off
	 B5 00 55 - All On Full (Send >=100ms after All On)
	 B8 00 55 - Zone 1 Full (Send >=100ms after Zone 1 On)
	 BD 00 55 - Zone 2 Full (Send >=100ms after Zone 2 On)
	 B7 00 55 - Zone 3 Full (Send >=100ms after Zone 3 On)
	 B2 00 55 - Zone 4 Full (Send >=100ms after Zone 4 On)
	 B9 00 55 - All Nightlight (Send >=100ms after All Off)
	 BB 00 55 - Zone 1 Nightlight (Send >=100ms after Zone 1 Off)
	 B3 00 55 - Zone 2 Nightlight (Send >=100ms after Zone 2 Off)
	 BA 00 55 - Zone 3 Nightlight (Send >=100ms after Zone 3 Off)
	 B6 00 55 - Zone 4 Nightlight (Send >=100ms after Zone 4 Off)
	 */
	white: {
		allOn: 0x35,
		allOff: 0x39,
		on0: 0x35,
		off0: 0x39,
		brightnessUp: 0x3c,
		brightnessDown: 0x34,
		warmer: 0x3e,
		cooler: 0x3f,
		on1: 0x38,
		off1: 0x3b,
		on2: 0x3d,
		off2: 0x33,
		on3: 0x37,
		off3: 0x3a,
		on4: 0x32,
		off4: 0x36,
		allOnFull: {first:'on0',then:0xb5},
		on0Full: {first:'on0',then:0xb5},
		on1Full: {first:'on1',then:0xb8},
		on2Full: {first:'on2',then:0xbd},
		on3Full: {first:'on3',then:0xb7},
		on4Full: {first:'on4',then:0xb2},
		allNightlight: {first:'off0',then:0xb9},
		nightlight0: {first:'off0',then:0xb9},
		nightlight1: {first:'off1',then:0xbb},
		nightlight2: {first:'off2',then:0xb3},
		nightlight3: {first:'off3',then:0xba},
		nightlight4: 0xb6,
	},
	/*
	 LimitlessLED RGBW
	 -------------------
	 41 00 55 - All Off
	 42 00 55 - All On
	 43 00 55 - Speed Down (One Step Slower Disco)
	 44 00 55 - Speed Up (One Step Faster Disco)
	 45 00 55 - Zone 1 On
	 46 00 55 - Zone 1 Off
	 47 00 55 - Zone 2 On
	 48 00 55 - Zone 2 Off
	 49 00 55 - Zone 3 On
	 4A 00 55 - Zone 3 Off
	 4B 00 55 - Zone 4 On
	 4C 00 55 - Zone 4 Off
	 4D 00 55 - One Step Disco Mode Up (20 Disco Modes)
	 42 00 55 wait 100ms then send C2 00 55 - All Zones Change back to Warm White.
	 45 00 55 wait 100ms then send C5 00 55 - Zone 1 Change back to Warm White.
	 47 00 55 wait 100ms then send C7 00 55 - Zone 2 Change back to Warm White.
	 49 00 55 wait 100ms then send C9 00 55 - Zone 3 Change back to Warm White.
	 4B 00 55 wait 100ms then send CB 00 55 - Zone 4 Change back to Warm White.
	 42 00 55 wait 100ms then send 4E XX 55 - Set All to Brightness XX (XX range is 0x02 to 0x1B)
	 45 00 55 wait 100ms then send 4E XX 55 - Set Zone 1 to Brightness XX (XX range is 0x02 to 0x1B)
	 47 00 55 wait 100ms then send 4E XX 55 - Set Zone 2 to Brightness XX (XX range is 0x02 to 0x1B)
	 49 00 55 wait 100ms then send 4E XX 55 - Set Zone 3 to Brightness XX (XX range is 0x02 to 0x1B)
	 4B 00 55 wait 100ms then send 4E XX 55 - Set Zone 4 to Brightness XX (XX range is 0x02 to 0x1B)
	 42 00 55 wait 100ms then send 40 XX 55 - Set All to Color XX (XX range is 0x00 to 0xFF)
	 45 00 55 wait 100ms then send 40 XX 55 - Set Zone 1 to Color XX (XX range is 0x00 to 0xFF)
	 47 00 55 wait 100ms then send 40 XX 55 - Set Zone 2 to Color XX (XX range is 0x00 to 0xFF)
	 49 00 55 wait 100ms then send 40 XX 55 - Set Zone 3 to Color XX (XX range is 0x00 to 0xFF)
	 4B 00 55 wait 100ms then send 40 XX 55 - Set Zone 4 to Color XX (XX range is 0x00 to 0xFF)
	 */
	rgbw: {
		on0: 0x42,
		off0: 0x41,
		on1: 0x45,
		off1: 0x46,
		on2: 0x47,
		off2: 0x48,
		on3: 0x49,
		off3: 0x4a,
		on4: 0x4b,
		off4: 0x4c
	}
	/* 

	 LimitlessLED RGB
	 ------------------
	 22 00 55 - Lamps On
	 21 00 55 - Lamps Off
	 23 00 55 - Brightness Up
	 24 00 55 - Brightness Down (There are nine steps between min and max)
	 27 00 55 - Mode Up
	 28 00 55 - Mode Down (There are 20 modes. The lowest is constant white)
	 25 00 55 - Speed Up (Fast)
	 26 00 55 - Speed Down (Slow)
	 20 xx 55 - Set Colour to xx

	 */
};

var WhiteController = function(opts){
	this.host = opts.host || '10.10.10.100';
	this.port = opts.port || 8899;
	this.socket = dgram.createSocket('udp4');
	this._commands = {
		on: [0x35,0x38,0x3d,0x37,0x32],
		off: [0x39,0x3b,0x33,0x3a,0x36],
		brightnessUp: 0x3c,
		brightnessDown: 0x34,
		warmer: 0x3e,
		cooler: 0x3f,
		onFull: [0xb5,0xb8,0xbd,0xb7,0xb2],
		nightlight: [0xb9,0xbb,0xb3,0xba,0xb6]
	};
	var self = this;
	this._send = function(group, hex, cb){
		if (!group) group = 0;//group === null? '' : 0;
		if (typeof hex == 'string') hex = self._commands[hex];
		if (hex instanceof Array) hex = hex[group];
		if (!cb) cb = function(err,res){
			if (err) throw err;
		};
		var buffer = new Buffer([hex].concat([0x00,0x55]), 'hex');
		self.socket.send(
			buffer,
			0,
			buffer.length,
			self.port,
			self.host,
			cb
		);
	};
	this.on = function(group,cb){self._send(group,'on',cb)};
	this.off = function(group,cb){self._send(group,'off',cb)};
	this.allOn = function(cb){self.on(0,cb);};
	this.allOff = function(cb){self.off(0,cb);};
	this.brightnessUp = function(group,cb){
		if (typeof group == 'undefined') self._send(null,'brightnessUp',cb);
		else self.on(group,function(err,resp){
			if (err) throw err;
			self._send(null,'brightnessUp',cb);
		});
	};
	this.brightnessDown = function(group,cb){
		if (typeof group == 'undefined') self._send(null,'brightnessDown',cb);
		else self.on(group,function(err,resp){
			if (err) throw err;
			self._send(null,'brightnessDown',cb);
		});
	};
	this.nightlight = function(group,cb){
		self.off(group,function(err,resp){
			if (err) throw err;
			setTimeout(function(){
				self._send(group,'nightlight',cb);
			},100);
		});
	};
};

module.exports = function(opts){
	return {
		WhiteController: new WhiteController(opts),
		//RGBWController: new RGBWController(opts)
	};
};