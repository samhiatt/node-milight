var controller = require('./')({host:'192.168.42.100'}).WhiteController;

//controller.on(1,function(err,res){
//	if (err) throw err;
//	console.log("RESPONSE:",res);
	//setTimeout(function(){
	//	controller.off(1,function(err,res){
	//		if (err) throw err;
	//		console.log(" RESPONSE:",res);
	//		process.exit();
	//	});
	//},100);
//});

//controller.off(1, function(err,res){
//	if (err) throw err;
//	console.log("GROUP 1 OFF RESPONSE:", res);
//	//process.exit();
//});

controller.off(1)