/// <reference path="types/node-0.10.d.ts" />

import dgram = require('dgram');

class Controller {
	host: string = '10.10.10.100';
	port: number = 8899;
	socket = dgram.createSocket('udp4');
	_send = function(group, hex, cb){
		if (!group) group = 0;
		if (typeof hex == 'string') hex = this.commands[hex];
		if (hex instanceof Array) hex = hex[group];
		if (!cb) cb = function(err,res){
			if (err) throw err;
		};
		var buffer = new Buffer([hex].concat([0x00,0x55]), 'hex');
		this.socket.send(
			buffer,
			0,
			buffer.length,
			this.port,
			this.host,
			cb
		);
	};
	on = function(group,cb){this._send(group,'on',cb)};
	off = function(group,cb){this._send(group,'off',cb)};
	allOn = function(cb){this.on(0,cb);};
	allOff = function(cb){this.off(0,cb);};
	brightnessUp = function(group,cb){
		if (typeof group == 'undefined') this._send(null,'brightnessUp',cb);
		else this.on(group,function(err,resp){
			if (err) throw err;
			this._send(null,'brightnessUp',cb);
		}.bind(this));
	};
	brightnessDown = function(group,cb){
		if (typeof group == 'undefined') this._send(null,'brightnessDown',cb);
		else this.on(group,function(err,resp){
			if (err) throw err;
			this._send(null,'brightnessDown',cb);
		}.bind(this));
	};
	nightlight = function(group,cb){
		this.off(group,function(err,resp){
			if (err) throw err;
			setTimeout(function(){
				this._send(group,'nightlight',cb);
			}.bind(this),100);
		});
	};
	constructor(opts) {
		if(opts.host) this.host = opts.host;
		if(opts.port) this.port = opts.port;
	}
}

class WhiteController extends Controller {
	commands = {
		on: [0x35,0x38,0x3d,0x37,0x32],
		off: [0x39,0x3b,0x33,0x3a,0x36],
		brightnessUp: 0x3c,
		brightnessDown: 0x34,
		warmer: 0x3e,
		cooler: 0x3f,
		onFull: [0xb5,0xb8,0xbd,0xb7,0xb2],
		nightlight: [0xb9,0xbb,0xb3,0xba,0xb6]
	};
	warmer = function(group,cb){
		if (typeof group == 'undefined') this._send(null,'warmer',cb);
		else this.on(group,function(err,resp){
			if (err) throw err;
			this._send(null,'warmer',cb);
		}.bind(this));
	};
	cooler = function(group,cb){
		if (typeof group == 'undefined') this._send(null,'cooler',cb);
		else this.on(group,function(err,resp){
			if (err) throw err;
			this._send(null,'cooler',cb);
		}.bind(this));
	};
}

module.exports = function(opts){
	return {
		WhiteController: new WhiteController(opts)
	};
};