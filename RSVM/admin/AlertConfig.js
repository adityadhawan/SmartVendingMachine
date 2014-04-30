var mongoose = require('mongoose'),
 VMStatus = mongoose.model('VMStatus'),
 AlarmType = mongoose.model('AlarmType'),
 Alert = mongoose.model('Alert'),
 AlertConfig = mongoose.model('AlertConfig'),
 InventoryStatus = mongoose.model('InventoryStatus'),
 User = mongoose.model('User');
var VMStatusCache1 = require('../admin/Test');

var getVMStatus = function(req,res){
	 
	VMStatus.find({})
	  .exec(function (err, VMStatus) {
		  if(err)console.log("Problem in get VM status  "+err);
		  	res.contentType('json');
		  	//console.log("VMStatus "+VMStatus);
        	res.send({ VMStatusData:VMStatus });
	  });
};

var getAlarmType = function(req,res){
	
	AlarmType.find({})
	  .exec(function (err, AlarmType) {
		  if(err)console.log("Problem in get Alarm Type  "+err);
		  	res.contentType('json');
		  	//console.log("AlarmType "+AlarmType);
       	res.send({ AlarmTypeData:AlarmType });
	  });
};

var getInventoryStatus = function(req,res){
	
	InventoryStatus.find({})
	  .exec(function (err, InventoryStatus) {
		  if(err)console.log("Problem in get Inventory status  "+err);
		  	res.contentType('json');
		  	//console.log("InventoryStatus "+InventoryStatus);
       	res.send({ InventoryStatusData:InventoryStatus });
	  });
};


var getAlertConfigList = function(req,res){
	
	AlertConfig
	.find({})		
		  .populate('userlist')
	      .populate('vm_status','status')
	      .populate('alarm_type','name')
	      .populate('inventory_status','status') 
	      .exec(function (err, AlertConfigDtls) {
		  if(err)console.log("Problem in get Inventory status  "+err);
		  	res.contentType('json');
		  	//console.log("AlertConfigDtls "+AlertConfigDtls);
       	    res.send({ AlertConfigData:AlertConfigDtls });
	  });
};

var addAlertConfig = function(req,res){
	
	
	var UserIds
	var vStatus
	console.log("response::::"+req.params.param);
	var alertConfigData =JSON.parse(req.params.param);
	console.log("UserList     "+alertConfigData.UserList);
	var userArr = alertConfigData.UserList.split(',');
	 var useridArr = combine_ids(userArr);
           User.where('name').in(eval(JSON.stringify (userArr).replace (/"/g,''))).select('_id')
			    .exec(function (err, UserIdList) {
				  if(err)console.log("Problem in get Inventory status  "+err);
				  	
				  	UserIds = UserIdList;
				  	if(alertConfigData.InventoryStatus == "")
					{
						alertConfigData.InventoryStatus = null;
						vStatus = alertConfigData.VMStatus;
					}
				  	if(alertConfigData.VMStatus == "")
					{
				  		alertConfigData.VMStatus = null;
				  		vStatus = alertConfigData.InventoryStatus;
					}
				  	
				  	new AlertConfig({
						name : alertConfigData.AlertConfig,
						userlist : UserIds,
						vm_status : alertConfigData.VMStatus,
						alarm_type : alertConfigData.AlarmType,
						alerttext : alertConfigData.AlertText,
						alertstatus:alertConfigData.AlertStatus,
						inventory_status:alertConfigData.InventoryStatus,
						allstatus : vStatus
					})
							.save(function(err, StockOutHistory) {
								if (err)
											console
													.log(" Error in addAlertConfig   "
															+ err),

											console
													.log("Data has been persisted For addAlertConfig");
											
							});
				  	
				 res.contentType('json');
				res.send({ AddAlertConfigData:"Success" });
		  });
	
	
	
};

function combine_ids(ids) {
	for(var i=0;i<ids.length;i++) {
		ids[i] = "'"+ids[i].trim()+"'";
	}
	/*var value = (ids.length ? "\"" + ids.join("\",\"") + "\"" : "");
	console.log("Value        "+value)
	   return value;*/
	return ids;
	}

function replaceId(ids) {
	
	var value = (ids.length ? "\'" + ids.join("\',\'") + "\'" : "");
	console.log("Value        "+value)
	   return value;
	
	}
/**
 * 
 */
var updateAlertConfig = function(req,res){
	
	console.log("response Upadte::::"+req.params.param);
	var query;
	var vStatus
	var alertConfigData =JSON.parse(req.params.param);
	var userArr = alertConfigData.UserList.split(',');
	

	 var useridArr = combine_ids(userArr);
		
          
		User.where('name').in(eval(JSON.stringify (userArr).replace (/"/g,''))).select('_id')
			    .exec(function (err, UserIdList) {
				  if(err)console.log("Problem in get Inventory status  "+err);
				  	
				  	UserIds = UserIdList;
				  	
				  	if(alertConfigData.InventoryStatus == "")
					{
						alertConfigData.InventoryStatus = '531716dd760ad435354cfc4b';
						vStatus = alertConfigData.VMStatus;
				   		
					}
				  	if(alertConfigData.VMStatus == "")
					{
				  		alertConfigData.VMStatus = '531716dd760ad435354cfc4c';
				  		vStatus = alertConfigData.InventoryStatus;
				  		
					}
				  	AlertConfig.findByIdAndUpdate( alertConfigData._id,  {name : alertConfigData.AlertConfig,
						userlist : UserIds, vm_status : alertConfigData.VMStatus ,alarm_type : alertConfigData.AlarmType,
						 alertstatus : alertConfigData.AlertStatus, inventory_status:alertConfigData.InventoryStatus,allstatus:vStatus

				}, { strict: false },
				function(err, numberAffected) {
					if (err)
					console.log("Error in update updateAlertConfig" + err);
					console.log("numberAffected in updateAlertConfig:::" + numberAffected);
					});
		 res.contentType('json');
		 res.send({ AddAlertConfigData:"Success" });	
 });	
};

var updateAlertConfig1 = function(req,res){
	
	console.log("response Upadte::::"+req.params.param);
	var query;
	var vStatus
	var alertConfigData =JSON.parse(req.params.param);
	var userArr = alertConfigData.UserList.split(',');
	 var useridArr = combine_ids(userArr);
	       User.where('name').in(eval(JSON.stringify (userArr).replace (/"/g,''))).select('_id')
			    .exec(function (err, UserIdList) {
				  if(err)console.log("Problem in get Inventory status  "+err);
				  	//console.log("=====   "+UserIdList[0]._id);
				  	 var jsonText = JSON.stringify(UserIdList);
					  var jsonObject = JSON.parse(jsonText);
					 // console.log("###  "+jsonObject._id)
					  
					  if(UserIdList.length > 0 ){
						    jsonObject.forEach(function(jsonObject) {
					    	
						    	AlertConfig.update({}, 
					  			//{$pull:{ userlist:new mongoose.Types.ObjectId((UserIdList[0]._id).toString())}},
						    		{$pull:{ userlist:new mongoose.Types.ObjectId((jsonObject._id).toString())}},
					  			
					  			{
					  				multi: true,
					  				upsert: false
					  				}
					  					, function(err, data,rwa){
					  					console.log(err, data,rwa);
				  	});
				});
					  }//if
		 res.contentType('json');
		 res.send({ AddAlertConfigData:"Success" });	
				  		      
		
 });
};


/**
 * 
 */


var deleteAlertConfig = function(req,res)
{
	
	console.log("DelteAlertConfig    "+req.params.param);
	
	var alertConfigData =JSON.parse(req.params.param);
	var DeleteAlertConfigArr = alertConfigData.DeleteAlertConfig.split(',');
	 var alertConfigidArr = combine_ids(DeleteAlertConfigArr);
	 //console.log("Arrray    "+eval(JSON.stringify (alertConfigidArr).replace (/"/g,'')))
	
	 AlertConfig.remove({'_id' :{$in:(eval(JSON.stringify (DeleteAlertConfigArr).replace (/"/g,'')))}}).
				       exec(function(err, numberAffected) {
					if (err)
					  console.log("Error in update deleteAlertConfig" + err);
					 // console.log("numberAffected in deleteAlertConfig:::" + numberAffected);
					
					    res.contentType('json');
					    res.send({ AddAlertConfigData:"Success" });
					});
		      	
	};

	
	
exports.setRoutes = function(app) {	
	app.post('/getVMStatus', getVMStatus);
	app.post('/getAlarmType', getAlarmType);
	app.post('/getInventoryStatus', getInventoryStatus);
	app.post('/getAlertConfigList', getAlertConfigList);
	app.post('/addAlertConfig/:param', addAlertConfig);
	app.post('/updateAlertConfig/:param', updateAlertConfig);
	app.post('/deleteAlertConfig/:param', deleteAlertConfig);
   
};
   