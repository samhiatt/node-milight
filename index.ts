/// <reference path="types/node-0.10.d.ts" />
/// <reference path="types/async.d.ts" />

import dgram = require('dgram');
import async = require('async');

class Controller {
	host: string = '10.10.10.100';
	port: number = 8899;
	socket = dgram.createSocket('udp4');
	_send = function(group, command, cb){
		// command can be either a command name string, or an array of numbers  
		if (!group && group != null) group = 0;
		var hex, buffer;
		var hex = this.commands[command];
		if (hex instanceof Array && hex.length == 5) hex = hex[group];
		var buffer: any = new Buffer(hex, 'hex');
		if (!cb) cb = function(err,res){
			if (err) throw err;
		};
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
	onFull = function(group,cb){
		if (!group) group = 0;
		this._send(group,'on',function(err,res){
			if (err) throw err;
			this._send(group,'onFull',cb)
		}.bind(this));
	};
	allOnFull = function(cb){this.onFull(0,cb);};
	brightnessUp = function(group,cb){
		if (group == null) this._send(null,'brightnessUp',cb);
		else this.on(group,function(err,resp){
			if (err) throw err;
			this._send(null,'brightnessUp',cb);
		}.bind(this));
	};
	brightnessDown = function(group,cb){
		if (group == null) this._send(null,'brightnessDown',cb);
		else this.on(group,function(err,resp){
			if (err) throw err;
			this._send(null,'brightnessDown',cb);
		}.bind(this));
	};
	darkest = function(group,cb){
		if (!group) group = 0;
		var self = this;
		this._send(group,'on',function(err,res){
			if (err) throw err;
			var funcs = [];
			for (var i = 0; i<9; i++){
				funcs.push(function(next){
					self._send(group,'brightnessDown',next);
				});
			}
			async.series(funcs,cb);
		});
	};
	brightness = function(level,group,cb){
		if (!group) group = 0;
		level = Math.floor(level/10);
		this.darkest(group,function(err,res){
			if (err) throw err;
			var range = [];
			for (var i=0; i<level; i++) {range.push(i);}
			async.mapSeries(range,
				function(i,next){
					setTimeout(function(){
						this.brightnessUp(group,function(err,res){
							if (err) throw err;
							next(null,res);
						});
					}.bind(this),20);
				}.bind(this),
				cb
			);
		}.bind(this));
	};
	nightlight = function(group,cb){
		this.off(group,function(err,resp){
			if (err) throw err;
			setTimeout(function(){
				this._send(group,'nightlight',cb);
			}.bind(this),100);
		}.bind(this));
	};
	constructor(opts) {
		if(opts.host) this.host = opts.host;
		if(opts.port) this.port = opts.port;
	}
}

class WhiteController extends Controller {
	commands = {
		on: [
			[0x35,0x00,0x55],
			[0x38,0x00,0x55],
			[0x3d,0x00,0x55],
			[0x37,0x00,0x55],
			[0x32,0x00,0x55]
		],
		off: [
			[0x39,0x00,0x55],
			[0x3b,0x00,0x55],
			[0x33,0x00,0x55],
			[0x3a,0x00,0x55],
			[0x36,0x00,0x55]
		],
		brightnessUp: [0x3c,0x00,0x55],
		brightnessDown: [0x34,0x00,0x55],
		warmer: [0x3e,0x00,0x55],
		cooler: [0x3f,0x00,0x55],
		onFull: [
			[0xb5,0x00,0x55],
			[0xb8,0x00,0x55],
			[0xbd,0x00,0x55],
			[0xb7,0x00,0x55],
			[0xb2,0x00,0x55]
		],
		nightlight: [
			[0xb9,0x00,0x55],
			[0xbb,0x00,0x55],
			[0xb3,0x00,0x55],
			[0xba,0x00,0x55],
			[0xb6,0x00,0x55]
		]
	};
	warmer = function(group,cb){
		if (group == null) this._send(null,'warmer',cb);
		else this.on(group,function(err,resp){
			if (err) throw err;
			this._send(null,'warmer',cb);
		}.bind(this));
	};
	cooler = function(group,cb){
		if (group == null) this._send(null,'cooler',cb);
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