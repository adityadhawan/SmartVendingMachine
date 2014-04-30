var mongoose = require('mongoose'),
InventoryStatus = mongoose.model('InventoryStatus'),
VendingMachine = mongoose.model('VendingMachine'),
Inventory = mongoose.model('Inventory'),
StockOutHistory = mongoose.model('StockOutHistory')
 
var logger= require('./../resource/logger.js');
var log=logger.LOG;

var getInventoryStatus = function(req,res)
{
	log.info("Inside getInventoryStatus() of InventoryMonitoring.js ");
	InventoryStatus.find({})
	  .exec(function (err, InventoryStatus) {
		  if(err)log.error("Problem in get VM status  "+err);
		  	res.contentType('json');
		  	//console.log("VMStatus "+VMStatus);
      	res.send({ InventoryStatus:InventoryStatus });
	  });
	};

	
/**
 * 
 */
	
	
	var getRegionDataInventory = function(req,res)
	{
		log.info("Inside getRegionDataInventory() of InventoryMonitoring.js ");
		VendingMachine.find().sort({name:1} ).select('_id region name')
		  .exec(function (err, RegionData) {
			  if(err){
				  log.error("Problem in getRegionData  "+err);
				  return;
				  }
			  	res.contentType('json');
			  	///console.log("getRegionData         "+RegionData);
	      	    res.send({ RegionData:RegionData });
		  });
		};
	
	

		
/**
 * 
 */
		var getVMDetailsByInventoryStatus = function(req,res)
		{
			log.info("Inside getVMDetailsByInventoryStatus() of InventoryMonitoring.js ");
			var now = new Date();
			now.setDate(now.getDate()-30);
			
			VendingMachine
				 .find({ InventoryStatus_time:{$gte: now}, inventory_status:{$ne:'OK'}})
				 .select('_id inventory_status name region time address resourceid')
				 .sort({InventoryStatus_time:-1} )
				 .exec(function (err, VMDetails) {
				      res.contentType('json');
				      res.send({ VMDetails: VMDetails });
				     // console.log("vmdetails    "+VMDetails)
			 });
		};
	

		
/**
 * 
 */

 
 var getAllItemStatusById= function(req,res)
{
	 log.info("Inside getAllItemStatusById() of InventoryMonitoring.js ");
	
    VendingMachine.getMachine(req.params.param,function(err,VMDetails){
    	//console.log("============== "+VMDetails)
	Inventory
	   .find({resource_id:VMDetails[0]._id})
	
	.populate('itemid','item')
	.exec(function (err, ItemStatus) {
	      res.contentType('json');
	      res.send({ ItemStatus: ItemStatus });
	     // console.log("Data:::::"+ItemStatus);
	});
});
  	
};		


		exports.setRoutes = function(app) {	
			app.post('/getRegionDataInventory', getRegionDataInventory);
			app.post('/getInventoryStatus', getInventoryStatus);
			app.post('/getVMDetailsByInventoryStatus', getVMDetailsByInventoryStatus);
			app.post('/getAllItemStatusById/:param', getAllItemStatusById);
			
		};