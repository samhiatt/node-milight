var milight = require('./')({host:'localhost',delay:1}),
	whiteCtrl=milight.WhiteController,
	rgbwCtrl=milight.RGBWController;
var udpserver = require('./udpserver');
var async = require('async');
var Promise = require('bluebird');
var assert = require('assert');

exports.setUp = function (callback) {
	udpserver.createServer(function(err,server){
		this.server = server;
		callback();
	}.bind(this));
};
exports.tearDown = function (callback) {
	this.server.close();
	callback();
};


var getMsgArray = function(msg){
	var msgArr = [];
	for (var i=0; i<msg.length; i++){
		msgArr.push(msg[i]);
	}
	return msgArr;
};

var testCommand = function(command,group,expected,server,test,callback){
	if (!(expected instanceof Array)) expected = [expected];
	var funcs = [];
	expected.forEach(function(expectedVal){
		funcs.push(function(next){
			server.once("message", function (msg, rinfo) {
				var msgArr = getMsgArray(msg);
				console.log("UDP server received:",JSON.stringify(msgArr));
				test.equal(msgArr[0], expectedVal, "Expected response for '"+command+"' group "+group+" command: msgArr[0]=="+expectedVal);
				next();
			});
		});
	});
	async.series(funcs, callback);
	milight.WhiteController[command](group);
};

function commandTester(controller,command,group,expected){
	return function(test){
		var server = this.server;
		assert(expected instanceof Array);
		if (!(expected[0] instanceof Array)) expected = [expected];
		var funcs = [];
		expected.forEach(function(expct){
			funcs.push(function(next){
				server.listenForMessage().then(function(message){
					test.equal(message[0],expct[0]);
					test.equal(message[1],expct[1]);
					test.equal(message[2],expct[2]);
					next();
				});
			});
		});
		async.series(funcs, function(){
			test.done();
		});
		controller.send(command, group);
	}
};

exports.testWhite = {
	testOn: {
		testOn0: commandTester(whiteCtrl,'on',0,[0x35,0x00,0x55]),
		testOn1: commandTester(whiteCtrl,'on',1,[0x38,0x00,0x55]),
		testOn2: commandTester(whiteCtrl,'on',2,[0x3d,0x00,0x55]),
		testOn3: commandTester(whiteCtrl,'on',3,[0x37,0x00,0x55]),
		testOn4: commandTester(whiteCtrl,'on',4,[0x32,0x00,0x55])
	},
	testOff: {
		testOff0: commandTester(whiteCtrl,'off',0,[0x39,0x00,0x55]),
		testOff1: commandTester(whiteCtrl,'off',1,[0x3b,0x00,0x55]),
		testOff2: commandTester(whiteCtrl,'off',2,[0x33,0x00,0x55]),
		testOff3: commandTester(whiteCtrl,'off',3,[0x3a,0x00,0x55]),
		testOff4: commandTester(whiteCtrl,'off',4,[0x36,0x00,0x55])
	},
	testBrightness: {
		testBrighter:  commandTester(whiteCtrl,'brighter',null,[0x3c,0x00,0x55]),
		testBrighter0: commandTester(whiteCtrl,'brighter',0,[[0x35,0x00,0x55],[0x3c,0x00,0x55]]),
		testBrighter1: commandTester(whiteCtrl,'brighter',1,[[0x38,0x00,0x55],[0x3c,0x00,0x55]]),
		testBrighter2: commandTester(whiteCtrl,'brighter',2,[[0x3d,0x00,0x55],[0x3c,0x00,0x55]]),
		testBrighter3: commandTester(whiteCtrl,'brighter',3,[[0x32,0x00,0x55],[0x3c,0x00,0x55]]),
		testBrighter4: commandTester(whiteCtrl,'brighter',4,[[0x37,0x00,0x55],[0x3c,0x00,0x55]]),
		testDimmer:  commandTester(whiteCtrl,'dimmer',null,[0x34,0x00,0x55]),
		testDimmer0: commandTester(whiteCtrl,'dimmer',0,[[0x35,0x00,0x55],[0x34,0x00,0x55]]),
		testDimmer1: commandTester(whiteCtrl,'dimmer',1,[[0x38,0x00,0x55],[0x34,0x00,0x55]]),
		testDimmer2: commandTester(whiteCtrl,'dimmer',2,[[0x3d,0x00,0x55],[0x34,0x00,0x55]]),
		testDimmer3: commandTester(whiteCtrl,'dimmer',3,[[0x32,0x00,0x55],[0x34,0x00,0x55]]),
		testDimmer4: commandTester(whiteCtrl,'dimmer',4,[[0x37,0x00,0x55],[0x34,0x00,0x55]])
	},
	testWarmnessCoolness: function(test){
		var server = this.server;
		async.series([
			function(cb){
				testCommand('warmer',null,0x3e,server,test,cb);
			},
			function(cb){
				testCommand('cooler',null,0x3f,server,test,cb);
			},
			function(cb){
				testCommand('warmer',1,[0x38,0x3e],server,test,cb);
			},
			function(cb){
				testCommand('cooler',1,[0x38,0x3f],server,test,cb);
			},
			function(cb){
				testCommand('warmer',2,[0x3d,0x3e],server,test,cb);
			},
			function(cb){
				testCommand('cooler',2,[0x3d,0x3f],server,test,cb);
			},
			function(cb){
				testCommand('warmer',3,[0x37,0x3e],server,test,cb);
			},
			function(cb){
				testCommand('cooler',3,[0x37,0x3f],server,test,cb);
			},
			function(cb){
				testCommand('warmer',4,[0x32,0x3e],server,test,cb);
			},
			function(cb){
				testCommand('cooler',4,[0x32,0x3f],server,test,cb);
			}
		],function(err,res){
			if (err) throw err;
			test.done();
		});
	},
	testOnFull: function(test){
		var server = this.server;
		async.series([
			function(cb){
				testCommand('onFull',0,[0x35,0xb5],server,test,cb);
			},
			function(cb){
				testCommand('onFull',1,[0x38,0xb8],server,test,cb);
			},
			function(cb){
				testCommand('onFull',2,[0x3d,0xbd],server,test,cb);
			},
			function(cb){
				testCommand('onFull',3,[0x37,0xb7],server,test,cb);
			},
			function(cb){
				testCommand('onFull',4,[0x32,0xb2],server,test,cb);
			}
		],function(err,res){
			if (err) throw err;
			test.done();
		});
	},
	testNightlight: function(test){
		var server = this.server;
		async.series([
			function(cb){
				testCommand('nightlight',0,[0x39,0xb9],server,test,cb);
			},
			function(cb){
				testCommand('nightlight',1,[0x3b,0xbb],server,test,cb);
			},
			function(cb){
				testCommand('nightlight',2,[0x33,0xb3],server,test,cb);
			},
			function(cb){
				testCommand('nightlight',3,[0x3a,0xba],server,test,cb);
			},
			function(cb){
				testCommand('nightlight',4,[0x36,0xb6],server,test,cb);
			}
		],function(err,res){
			if (err) throw err;
			test.done();
		});
	},
	testDarkest: function(test){
		var server = this.server;
		async.series([
			function(cb){
				testCommand('darkest',0,[0x35,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34],server,test,cb);
			},
			function(cb){
				testCommand('darkest',1,[0x38,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34],server,test,cb);
			},
			function(cb){
				testCommand('darkest',2,[0x3d,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34],server,test,cb);
			},
			function(cb){
				testCommand('darkest',3,[0x37,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34],server,test,cb);
			},
			function(cb){
				testCommand('darkest',4,[0x32,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34,0x34],server,test,cb);
			}
		],function(err,res){
			if (err) throw err;
			test.done();
		});
	},
	testWarmest: function(test){
		var server = this.server;
		async.series([
			function(cb){
				testCommand('warmest',0,[0x35,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e],server,test,cb);
			},
			function(cb){
				testCommand('warmest',1,[0x38,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e],server,test,cb);
			},
			function(cb){
				testCommand('warmest',2,[0x3d,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e],server,test,cb);
			},
			function(cb){
				testCommand('warmest',3,[0x37,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e],server,test,cb);
			},
			function(cb){
				testCommand('warmest',4,[0x32,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e,0x3e],server,test,cb);
			}
		],function(err,res){
			if (err) throw err;
			test.done();
		});
	},
	testCoolest: function(test){
		var server = this.server;
		async.series([
			function(cb){
				testCommand('coolest',0,[0x35,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f],server,test,cb);
			},
			function(cb){
				testCommand('coolest',1,[0x38,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f],server,test,cb);
			},
			function(cb){
				testCommand('coolest',2,[0x3d,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f],server,test,cb);
			},
			function(cb){
				testCommand('coolest',3,[0x37,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f],server,test,cb);
			},
			function(cb){
				testCommand('coolest',4,[0x32,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f,0x3f],server,test,cb);
			}
		],function(err,res){
			if (err) throw err;
			test.done();
		});
	}
};
exports.testRGBW = {
	testOn: {
		testOn0: commandTester(rgbwCtrl,'on',0,[0x42,0x00,0x55]),
		testOn1: commandTester(rgbwCtrl,'on',1,[0x45,0x00,0x55]),
		testOn2: commandTester(rgbwCtrl,'on',2,[0x47,0x00,0x55]),
		testOn3: commandTester(rgbwCtrl,'on',3,[0x49,0x00,0x55]),
		testOn4: commandTester(rgbwCtrl,'on',4,[0x4b,0x00,0x55])
	},
	testOff: {
		testOff0: commandTester(rgbwCtrl,'off',0,[0x41,0x00,0x55]),
		testOff1: commandTester(rgbwCtrl,'off',1,[0x46,0x00,0x55]),
		testOff2: commandTester(rgbwCtrl,'off',2,[0x48,0x00,0x55]),
		testOff3: commandTester(rgbwCtrl,'off',3,[0x4a,0x00,0x55]),
		testOff4: commandTester(rgbwCtrl,'off',4,[0x4c,0x00,0x55])
	}
};

// hack to exit tests
//setTimeout(function(){
//	console.log("Tests timed out. Exiting.");
//	process.exit(0)
//},5000);