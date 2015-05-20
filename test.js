var controller = require('./')({host:'localhost',lights:'white'});

controller.allOff(function(err,res){
	if (err) throw err;
	console.log("ALL OFF RESPONSE:",res);
	//process.exit();
});

controller.off(1, function(err,res){
	if (err) throw err;
	console.log("GROUP 1 OFF RESPONSE:", res);
	//process.exit();
});