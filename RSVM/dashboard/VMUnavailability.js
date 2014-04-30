var mongoose = require('mongoose'),
 VMStatus = mongoose.model('VMStatus'),
 VendingMachine = mongoose.model('VendingMachine'),
 StatusHistory = mongoose.model('StatusHistory'),
 MockServiceMgmt = mongoose.model('MockServiceMgmtSchema')
 var logger= require('./../resource/logger.js');
var log=logger.LOG;

/**
*
*/ 

var getFaultData = function(req,res)
{
	log.info("Inside getFaultData() of VMUnavailability.js");
	VMStatus.find({})
	  .exec(function (err, VMStatus) {
		  if(err)log.error("Problem in get VM status  "+err);
		  	res.contentType('json');
		  	//console.log("VMStatus "+VMStatus);
      	res.send({ VMStatusData:VMStatus });
	  });
	};

	
/**
 * 
 */
	
	
	var getRegionData = function(req,res)
	{
		log.info("Inside getRegionData() of VMUnavailability.js");
		VendingMachine.find({status:{$ne:'available'}}).sort({name:1} ).select('_id region name')
		  .exec(function (err, RegionData) {
			  if(err)log.error("Problem in getRegionData  "+err);
			  	res.contentType('json');
			  //console.log("RegionData "+RegionData);
	      	res.send({ RegionData:RegionData });
		  });
		};
	
	

		
/**
 * 
 */
		var getAllUnavailableData = function(req,res)
		{
			log.info("Inside getAllUnavailableData() of VMUnavailability.js");
			var now = new Date();
			now.setDate(now.getDate()-30);
			
			VendingMachine
				 .find({ VMStatus_time:{$gte: now}, status:{$ne:'available'}})
				 .select('_id status name region VMStatus_time address resourceid')
				 .sort({VMStatus_time:-1} )
				 .exec(function (err, VMDetails) {
				      res.contentType('json');
				      res.send({ VMDetails: VMDetails });
				      //console.log("Unavailability  vmdetails    "+VMDetails)
			 });
		};
	

		
/**
 * 
 */
var getHistoryDataById = function(req,res)
{
	log.info("Inside getHistoryDataById() of VMUnavailability.js");
	var now = new Date();
		now.setDate(now.getDate()-30);
		console.log("Param   "+req.params.param);
		VendingMachine.getMachine(req.params.param,function(err,VMDetails){
			//console.log("+================================  "+VMDetails);
			StatusHistory
				.find({ time:{$gte: now}, resource_id:VMDetails[0]._id, errorcode:{$ne:'available'}})
				.select('errorcode time')
				.sort({time:-1} )
				.exec(function (err, VMDetails) {
				      res.contentType('json');
				      res.send({ VMDetails: VMDetails });
				     // console.log("Data::getHistoryDataById:::"+VMDetails);
			});
		});

 
};

var getTicketDetails = function(req,res)
{
	log.info("Inside getTicketDetails() of VMUnavailability.js");
	
	MockServiceMgmt.find({resource_id:req.params.param})
	.exec(function(err,TicketDtals){
		  res.contentType('json');
	      res.send({ ServiceDetails: TicketDtals });
	      //console.log("TicketDetails:::::"+TicketDtals);
	});
};

	

exports.setRoutes = function(app) {	
		app.post('/getRegionData', getRegionData);
		app.post('/getFaultData', getFaultData);
		app.post('/getAllUnavailableData', getAllUnavailableData);
		app.post('/getTicketDetails/:param', getTicketDetails);
		app.post('/getHistoryDataById/:param', getHistoryDataById);
		
	};
	