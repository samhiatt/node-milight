var milight = require('./')({host:'localhost'});
var udpserver = require('./udpserver');
var async = require('async');

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

function testCommand(command,group,expected,server,test,callback){
	if (!(expected instanceof Array)) expected = [expected];
	var funcs = [];
	expected.forEach(function(expectedVal){
		funcs.concat(function(cb) {
			async.parallel([
				function(cb){
					server.once("message", function (msg, rinfo) {
						var msgArr = getMsgArray(msg);
						test.equal(msgArr[0], expectedVal, "Expected response for '"+command+"' group "+group+" command: msgArr[0]=="+expectedVal);
						cb();
					});}.bind(this),
				function(cb){
					var udpCb = function(err,res){
						if (err) throw err;
						test.equal(res,3,"Expected UDP response: 3");
						cb();
					};
					if (group != null) milight.WhiteController[command](group,udpCb);
					else milight.WhiteController[command](null,udpCb);
				}.bind(this),
			],callback);
		});
	});
	async.series(funcs, callback);
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
			},
		],function(err,res){
			if (err) throw err;
			test.done();
		});
	},
	testBrightnessUpDown: function(test){
		var server = this.server;
		async.series([
			function(cb){
				testCommand('brightnessUp',null,0x3c,server,test,cb);
			},
			function(cb){
				testCommand('brightnessDown',null,0x34,server,test,cb);
			},
			function(cb){
				testCommand('brightnessUp',1,[0x38,0x3c],server,test,cb);
			},
			function(cb){
				testCommand('brightnessDown',1,[0x38,0x34],server,test,cb);
			},
			function(cb){
				testCommand('brightnessUp',2,[0x3d,0x3c],server,test,cb);
			},
			function(cb){
				testCommand('brightnessDown',2,[0x3d,0x34],server,test,cb);
			},
			function(cb){
				testCommand('brightnessUp',3,[0x37,0x3c],server,test,cb);
			},
			function(cb){
				testCommand('brightnessDown',3,[0x37,0x34],server,test,cb);
			},
			function(cb){
				testCommand('brightnessUp',4,[0x32,0x3c],server,test,cb);
			},
			function(cb){
				testCommand('brightnessDown',4,[0x32,0x34],server,test,cb);
			}
		],function(err,res){
			if (err) throw err;
			test.done();
			// hack to exit tests
			setTimeout(function(){process.exit(0)},1000);
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
			// hack to exit tests
			setTimeout(function(){process.exit(0)},1000);
		});
	},
	testOnFull: function(test){
		var server = this.server;
		async.series([
			function(cb){
				testCommand('onFull',null,[0x35,0xb5],server,test,cb);
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
			// hack to exit tests
			setTimeout(function(){process.exit(0)},1000);
		});
	}
};