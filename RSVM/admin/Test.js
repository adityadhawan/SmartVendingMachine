var mongoose = require('mongoose'),
 VMStatus = mongoose.model('VMStatus'),
 VendingMachine = mongoose.model('VendingMachine'),
 StatusHistory = mongoose.model('StatusHistory'),
 MockServiceMgmt = mongoose.model('MockServiceMgmtSchema'),
 User = mongoose.model('User')
 var logger= require('./../resource/logger.js');
 var log=logger.LOG;

 var VMStatusCache = {};
 
var getVMStatus = function(value)
{
	console.log("Inside getFaultData() of VMUnavailability.js");
	VMStatus.find({},{_id:0})
	  .exec(function (err, VMStatus) {
		  if(err)log.error("Problem in get VM status  "+err);
		  //	res.contentType('json');
		  	console.log("VMStatus "+VMStatus);
		  	 var removeId = JSON.stringify(VMStatus).replace(/\{"status":/g,"");
		  	try{ 
		  		var arrayOfObjectIds = removeId.replace(/\}/g,"");
		  		VMStatusCache.name = VMStatus;
		  		//var val = processData(VMStatusCache);
		  		//res.send({ VMStatusData:VMStatus });
		  		//console.log("-----  "+val);
		  		console.log("=====  "+JSON.stringify(VMStatusCache));
		  	}catch(e){
		  		   console.log("9999999  "+e)
		  		   return;
		  		}
		  	
	  });
};

var processData = function(value)
{
	var jsObjects = value.name;
	var result = jsObjects.filter(function( obj ) {
		  return obj.status == 'available';
		});
	
	
	}

/*exports.setRoutes = function(app) {	
	app.get('/Test/getVMStatus', getVMStatus);
	
};*/

module.exports.getValue = "Ritesh=====";
module.exports = getVMStatus;
