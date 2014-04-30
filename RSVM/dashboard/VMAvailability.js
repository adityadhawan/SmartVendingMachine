var mongoose = require('mongoose'),
 VMStatus = mongoose.model('VMStatus'),
 VendingMachine = mongoose.model('VendingMachine'),
 InventoryStatus = mongoose.model('InventoryStatus'),
 Inventory = mongoose.model('Inventory')
 var logger= require('./../resource/logger.js');
var log=logger.LOG;
 
 var getRegionDataAvailability = function(req,res)
	{
	   log.info("Inside getRegionDataAvailability() of VMAvailability");
		VendingMachine.find({}).sort({name:1} ).select('_id region name')
		  .exec(function (err, RegionData) {
			  if(err)log.error("Problem in getRegionData  "+err);
			  	res.contentType('json');
			  //console.log("RegionData "+RegionData);
	      	   res.send({ RegionData:RegionData });
		  });
		};
		
		
		
		var getVMStatusData = function(req,res)
		{
			log.info("Inside getVMStatusData() of VMAvailability");
			VMStatus.find({})
			  .exec(function (err, VMStatus) {
				  if(err)log.error("Problem in get VM status  "+err);
				  	res.contentType('json');
				  	//console.log("VMStatus "+VMStatus);
		      	    res.send({ VMStatusData:VMStatus });
			  });
			};
			
		
			var getStockStatusData = function(req,res)
			{
				log.info("Inside getStockStatusData() of VMAvailability");
				InventoryStatus.find({})
				  .exec(function (err, StockStatusData) {
					  if(err)log.error("Problem in get VM status  "+err);
					  	res.contentType('json');
					  	//console.log("StockStatusData "+StockStatusData);
			      	    res.send({ StockStatusData:StockStatusData });
				  });
				};
				
				var getVMDetails = function(req,res)
				{
					log.info("Inside getVMDetails() of VMAvailability");
					var now = new Date();
					now.setDate(now.getDate()-30);
					
					VendingMachine
						 .find({ VMStatus_time:{$gte: now}})
						 .select('_id status name region time address resourceid inventory_status location longitude latitude')
						 .sort({VMStatus_time:-1} )
						 .exec(function (err, VMDetails) {
						      res.contentType('json');
						      res.send({ VMDetails: VMDetails });
						    // console.log("vmdetails==================    "+VMDetails)
					 });
				};
				
				
				exports.setRoutes = function(app) {	
					app.post('/getRegionDataAvailability', getRegionDataAvailability);
					app.post('/getVMDetails', getVMDetails);
					app.post('/getStockStatusData', getStockStatusData);
					app.post('/getVMStatusData', getVMStatusData);
					
				};
			