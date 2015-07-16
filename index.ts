/// <reference path="typings/node-0.10.d.ts" />
/// <reference path="typings/async.d.ts" />
/// <reference path="typings/bluebird/bluebird.d.ts" />

import dgram = require('dgram');
import async = require('async');
import Promise = require('bluebird');

class Controller {
	host: string = '10.10.10.100';
	port: number = 8899;
	delay: number = 50;
	socket = dgram.createSocket('udp4');
	_send = function(group, command, cb){ 
		if (!group && group != null) group = 0;
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
	brighter = function(group,cb){
		if (group == null) this._send(null,'brighter',cb);
		else this.on(group,function(err,resp){
			if (err) throw err;
			this._send(null,'brighter',cb);
		}.bind(this));
	};
	dimmer = function(group,cb){
		if (group == null) this._send(null,'dimmer',cb);
		else this.on(group,function(err,resp){
			if (err) throw err;
			this._send(null,'dimmer',cb);
		}.bind(this));
	};
	darkest = function(group,cb){
		if (!group) group = 0;
		var self = this;
		this._send(group,'on',function(err,res){
			if (err) throw err;
			var funcs = [];
			for (var i = 0; i<10; i++){
				funcs.push(function(next){
					setTimeout(function(){
						self._send(null,'dimmer',next);
					},self.delay);
				});
			}
			async.series(funcs,cb);
		});
	};
	setBrightness = function(level,group,cb){
		if (!group) group = 0;
		level = Math.floor(level/10);
		this.darkest(group,function(err,res){
			if (err) throw err;
			var range = [];
			for (var i=0; i<level; i++) {range.push(i);}
			async.mapSeries(range,
				function(i,next){
					setTimeout(function(){
						this.brighter(group,function(err,res){
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
	send = function(command,group){
		var self = this;
		if (!group) group = 0;
		return new Promise(function (resolve, reject) {
			self._send(group,command, function (err, res) {
				if (err) reject(err);
				else resolve(res);
			});
		});
	};
	constructor(opts) {
		if(opts.host) this.host = opts.host;
		if(opts.port) this.port = opts.port;
		if(opts.delay) this.delay = opts.delay;
	}
}

class RGBWController extends Controller {
	commands = {
		on: [
			[0x42,0x00,0x55],
			[0x45,0x00,0x55],
			[0x47,0x00,0x55],
			[0x49,0x00,0x55],
			[0x4b,0x00,0x55]
		],
		off: [
			[0x41,0x00,0x55],
			[0x46,0x00,0x55],
			[0x48,0x00,0x55],
			[0x4a,0x00,0x55],
			[0x4c,0x00,0x55]
		],
		disco: [0x4d,0x00,0x55],
		faster: [0x44,0x00,0x55],
		slower: [0x43,0x00,0x55],
		white: [
			[[0x42,0x00,0x55],[0xc2,0x00,0x55]],
			[[0x45,0x00,0x55],[0xc5,0x00,0x55]],
			[[0x47,0x00,0x55],[0xc7,0x00,0x55]],
			[[0x49,0x00,0x55],[0xc7,0x00,0x55]],
			[[0x4b,0x00,0x55],[0xcb,0x00,0x55]]
		],
		brightness: [
			[[0x42,0x00,0x55],[0x4e,[0x02,0x1b],0x55]],
			[[0x45,0x00,0x55],[0x4e,[0x02,0x1b],0x55]],
			[[0x47,0x00,0x55],[0x4e,[0x02,0x1b],0x55]],
			[[0x49,0x00,0x55],[0x4e,[0x02,0x1b],0x55]],
			[[0x4b,0x00,0x55],[0x4e,[0x02,0x1b],0x55]]
		],
		color: [
			[[0x42,0x00,0x55],[0x40,[0x00,0xff],0x55]],
			[[0x45,0x00,0x55],[0x40,[0x00,0xff],0x55]],
			[[0x47,0x00,0x55],[0x40,[0x00,0xff],0x55]],
			[[0x49,0x00,0x55],[0x40,[0x00,0xff],0x55]],
			[[0x4b,0x00,0x55],[0x40,[0x00,0xff],0x55]]
		]
	};
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
		brighter: [0x3c,0x00,0x55],
		dimmer: [0x34,0x00,0x55],
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
	warmest = function(group,cb){
		if (!group) group = 0;
		var self = this;
		this.on(group,function(err,res){
			if (err) throw err;
			var funcs = [];
			for (var i = 0; i<10; i++){
				funcs.push(function(next){
					setTimeout(function(){
						self.warmer(null,next);
					},self.delay);
				});
			}
			async.series(funcs,cb);
		});
	};
	cooler = function(group,cb){
		if (group == null) this._send(null,'cooler',cb);
		else this.on(group,function(err,resp){
			if (err) throw err;
			this._send(null,'cooler',cb);
		}.bind(this));
	};
	coolest = function(group,cb){
		if (!group) group = 0;
		var self = this;
		this.on(group,function(err,res){
			if (err) throw err;
			var funcs = [];
			for (var i = 0; i<10; i++){
				funcs.push(function(next){
					setTimeout(function(){
						self.cooler(null,next);
					},self.delay);
				});
			}
			async.series(funcs,cb);
		});
	};
	setCoolness = function(level,group,cb){
		if (!group) group = 0;
		var self = this;
		this.coolest(group, function(err,res){
			if (err) throw err;
			var funcs = [];
			for (var i = 100; i>level; i-=10){
				funcs.push(function(next){
					setTimeout(function(){
						self.warmer(null,next);
					},self.delay);
				});
			}
			async.series(funcs,cb);
		});
	};
	setWarmness = function(level,group,cb){
		if (!group) group = 0;
		var self = this;
		this.warmest(group, function(err,res){
			if (err) throw err;
			var funcs = [];
			for (var i = 100; i>level; i-=10){
				funcs.push(function(next){
					setTimeout(function(){
						self.cooler(null,next);
					},self.delay);
				});
			}
			async.series(funcs,cb);
		});
	};
}

module.exports = function(opts){
	return {
		WhiteController: new WhiteController(opts),
		RGBWController: new RGBWController(opts)
	};
};