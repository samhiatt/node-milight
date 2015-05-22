var milight = require('./')({host:'localhost',delay:1});
var udpserver = require('./udpserver');
var async = require('async');
var Promise = require('bluebird');

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

exports.testWhite = {
	testOnOff: function(test){
		var server = this.server;
		async.series([
			function(cb){
				testCommand('on',0,0x35,server,test,cb);
			},
			function(cb){
				testCommand('off',0,0x39,server,test,cb);
			},
			function(cb){
				testCommand('on',1,0x38,server,test,cb);
			},
			function(cb){
				testCommand('off',1,0x3b,server,test,cb);
			},
			function(cb){
				testCommand('on',2,0x3d,server,test,cb);
			},
			function(cb){
				testCommand('off',2,0x33,server,test,cb);
			},
			function(cb){
				testCommand('on',3,0x37,server,test,cb);
			},
			function(cb){
				testCommand('off',3,0x3a,server,test,cb);
			},
			function(cb){
				testCommand('on',4,0x32,server,test,cb);
			},
			function(cb){
				testCommand('off',4,0x36,server,test,cb);
			}
		],function(err,res){
			if (err) throw err;
			test.done();
		});
	},
	testBrightnessUpDown: function(test){
		var server = this.server;
		async.series([
			function(cb){
				testCommand('brighter',null,0x3c,server,test,cb);
			},
			function(cb){
				testCommand('dimmer',null,0x34,server,test,cb);
			},
			function(cb){
				testCommand('brighter',1,[0x38,0x3c],server,test,cb);
			},
			function(cb){
				testCommand('dimmer',1,[0x38,0x34],server,test,cb);
			},
			function(cb){
				testCommand('brighter',2,[0x3d,0x3c],server,test,cb);
			},
			function(cb){
				testCommand('dimmer',2,[0x3d,0x34],server,test,cb);
			},
			function(cb){
				testCommand('brighter',3,[0x37,0x3c],server,test,cb);
			},
			function(cb){
				testCommand('dimmer',3,[0x37,0x34],server,test,cb);
			},
			function(cb){
				testCommand('brighter',4,[0x32,0x3c],server,test,cb);
			},
			function(cb){
				testCommand('dimmer',4,[0x32,0x34],server,test,cb);
			}
		],function(err,res){
			if (err) throw err;
			test.done();
		});
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
		testOn0: function(test){
			this.server.listenForMessage().then(function(message){
				test.equal(message[0],0x42);
				test.done();
			});
			milight.RGBWController.send('on');
		},
		testOn1: function(test){
			this.server.listenForMessage().then(function(message){
				test.equal(message[0],0x45);
				test.done();
			});
			milight.RGBWController.send('on',1);
		},
		testOn2: function(test){
			this.server.listenForMessage().then(function(message){
				test.equal(message[0],0x47);
				test.done();
			});
			milight.RGBWController.send('on',2);
		},
		testOn3: function(test){
			this.server.listenForMessage().then(function(message){
				test.equal(message[0],0x49);
				test.done();
			});
			milight.RGBWController.send('on',3);
		},
		testOn4: function(test){
			this.server.listenForMessage().then(function(message){
				test.equal(message[0],0x4b);
				test.done();
			});
			milight.RGBWController.send('on',4);
		}
	},
	testOff: {
		testOff0: function(test){
			this.server.listenForMessage().then(function(message){
				test.equal(message[0],0x41);
				test.done();
			});
			milight.RGBWController.send('off');
		},
		testOff1: function(test){
			this.server.listenForMessage().then(function(message){
				test.equal(message[0],0x46);
				test.done();
			});
			milight.RGBWController.send('off',1);
		},
		testOff2: function(test){
			this.server.listenForMessage().then(function(message){
				test.equal(message[0],0x48);
				test.done();
			});
			milight.RGBWController.send('off',2);
		},
		testOff3: function(test){
			this.server.listenForMessage().then(function(message){
				test.equal(message[0],0x4a);
				test.done();
			});
			milight.RGBWController.send('off',3);
		},
		testOff4: function(test){
			this.server.listenForMessage().then(function(message){
				test.equal(message[0],0x4c);
				test.done();
			});
			milight.RGBWController.send('off',4);
		}
	}
};

// hack to exit tests
setTimeout(function(){
	console.log("Tests timed out. Exiting.");
	process.exit(0)
},5000);