var mongoose = require('mongoose'),
InventoryStatus = mongoose.model('InventoryStatus'),
VendingMachine = mongoose.model('VendingMachine'),
Inventory = mongoose.model('Inventory'),
Coupon = mongoose.model('Coupon'),
Item = mongoose.model('Item')
 var logger= require('./../resource/logger.js');
var log=logger.LOG;


var getRegionWithVMNameAndItem = function(req,res)
{
	log.info("Inside getRegionWithVMNameAndItem() of VMCoupon.js");
			Inventory
			.find({})
			.populate({
						  path:'resource_id',
						  select:'region name location address _id'
					})
			   
			      .populate('itemid','item')
			      .exec(function (err, RegionWithVMNameAndItem) {
			      res.contentType('json');
			      res.send({ VMDetails: RegionWithVMNameAndItem });
			      //console.log("RegionWithVMNameAndItem:::::"+RegionWithVMNameAndItem);
			});
	
};

var getCouponIssuedChartData = function(req,res){
	
	log.info("Inside getCouponIssuedChartData() of VMCoupon.js");
	var param = req.params.param.split("&");
	var vfromDate = param[0];
	var toDate = param[1];
	var vDate = new Date(toDate);
	var vtoDate = vDate.getTime()+86399999;
	var endDate = new Date(vtoDate);
	
	
	Coupon.aggregate( 
					{$match:{$and:[
					 {genratedon:{$gte:new Date(vfromDate)}},
					 {genratedon:{$lte:endDate}}
					
					]}},
									
	                            {$group : 
	                            	{
	                            		_id : "$item", 
	                            		total : {$sum : 1},
	                            		
	                                }
	                            },
	                             { $project: {
	                            	 			
	                            	 			total:1
	                            	 			
	                             			}
	                             },
	                                 function (err, CouponIssuedChartData) {
	                        	        if (err)log.error("Error CouponIssuedChartData "+err);           	           
	                        	           res.contentType("json");
	   		                               res.send({CouponIssuedChartData: CouponIssuedChartData});
	   		                               //console.log("CouponIssuedChartData::::"+JSON.stringify(CouponIssuedChartData)); 
	   		                                
	                         });
				
				
};	


var getCouponConsumedChartDataAll = function(req,res){
	log.info("Inside getCouponConsumedChartDataAll() of VMCoupon.js");
	var param = req.params.param.split("&");
	var vfromDate = param[0];
	var toDate = param[1];
	var vDate = new Date(toDate);
	var vtoDate = vDate.getTime()+86399999;
	var endDate = new Date(vtoDate);
	Coupon.aggregate( 
			{$match:{$and:[
			               	 {resource_id: { $ne: null}},
							 {consumedon:{$gte:new Date(vfromDate)}},
							 {consumedon:{$lte:endDate}},
							 {genratedon:{$gte:new Date(vfromDate)}},
							 {genratedon:{$lte:endDate}}
							
							]}},
								
									
								{$group : 
	                            	{
	                            		_id : "$item",
	                            		total : {$sum : 1},
	                            		
	                                }
	                            },
	                             { $project: {
	                            	 			total:1,
	                             			}
	                             },
	                                 function (err, CouponConsumedChartDataALL) {
	                        	        if (err)log.error("Error to find CouponConsumedChartData ");           	           
	                        	           res.contentType("json");
	   		                               res.send({CouponConsumedChartDataAll: CouponConsumedChartDataALL});
	   		                              //console.log("CouponConsumedChartData::::"+JSON.stringify(CouponConsumedChartDataALL)); 
	   		                                
	                         });
	
				
};



var getCouponConsumedChartDataByRegion = function(req,res){
	log.info("Inside getCouponConsumedChartDataByRegion() of VMCoupon.js");
	var param = req.params.param.split("&");
	var region =param[0];
	var vfromDate = param[1];
	var toDate = param[2];
	var vDate = new Date(toDate);
	var vtoDate = vDate.getTime()+86399999;
	var endDate = new Date(vtoDate);
	Coupon.aggregate( 
				{$match:{$and:[
				               	 
				               	 {resource_id: { $ne: null}},
				               	 {resource_region:region},
				               	 {consumedon:{$gte:new Date(vfromDate)}},
								 {consumedon:{$lte:endDate}},
								 {genratedon:{$gte:new Date(vfromDate)}},
								 {genratedon:{$lte:endDate}}
								
								]}},
									
								{$group : 
	                            	{
	                            		_id : "$item",
	                            		total : {$sum : 1},
	                            		
	                                }
	                            },
	                             { $project: {
	                            	 			total:1,
	                             			}
	                             },
	                                 function (err, CouponConsumedChartDataByRegion) {
	                        	        if (err)log.error("Error to find CouponConsumedChartData ");           	           
	                        	           res.contentType("json");
	   		                               res.send({CouponConsumedChartDataAll: CouponConsumedChartDataByRegion});
	   		                               //console.log("CouponConsumedChartData::::"+JSON.stringify(CouponConsumedChartDataByRegion)); 
	   		                             
	                         });
	
				
};

var getCouponConsumedChartDataByVMName = function(req,res){
	log.info("Inside getCouponConsumedChartDataByVMName() of VMCoupon.js");
	var param = req.params.param.split("&");
	var VMName = param[0];
	var vfromDate = param[1];
	var toDate = param[2];
	var vDate = new Date(toDate);
	var vtoDate = vDate.getTime()+86399999;
	var endDate = new Date(vtoDate);
	Coupon.aggregate( 
					{$match:{$and:[
					               	 
					               	 {resource_id: { $ne: null}},
					               	 {resource_name:VMName},
					               	 {consumedon:{$gte:new Date(vfromDate)}},
									 {consumedon:{$lte:endDate}},
									 {genratedon:{$gte:new Date(vfromDate)}},
									 {genratedon:{$lte:endDate}}
									
									]}},
			
								{$group : 
	                            	{
	                            		_id : "$item",
	                            		 total : {$sum : 1},
	                            		
	                                }
	                            },
	                             { $project: {
	                            	 			total:1,
	                             			}
	                             },
	                                 function (err, CouponConsumedChartDataByVMName) {
	                        	        if (err)log.error("Error to find CouponConsumedChartData ");           	           
	                        	           res.contentType("json");
	   		                               res.send({CouponConsumedChartDataAll: CouponConsumedChartDataByVMName});
	   		                               //console.log("CouponConsumedChartData::::"+JSON.stringify(CouponConsumedChartDataByVMName)); 
	   		                               
	                         });
	
				
};



var getCouponConsumedReport = function(req, res)
{ 
	log.info("Inside getCouponConsumedReport() of VMCoupon.js");
	var now = new Date();
	now.setDate(now.getDate()-30);
	console.log("Inside getCouponConsumedReport()")
		Coupon.distinct('resource_name',{resource_name: { $ne: null},consumedon:{$gte: now}}).exec(function(err, VMName){
		 if(err){log.error("Error inside getCouponConsumedReport()   "+err)}
		   getVMDeatilsByName(req,res,VMName);
		
	 });
	
	};

	var getVMDeatilsByName= function(req, res,VMName)
	{ 
		log.info("Inside getVMDeatilsByName() of VMCoupon.js");
		
		VendingMachine.find({name: { $in:eval(VMName)}}).exec(function(err,VMDeatils){
			  if(err){log.error("Error inside getVMDeatilsByName() ")}
			   CouponConsumptionReport(req, res, VMDeatils);
		
		});
		
	};



var CouponConsumptionReport = function(req, res,VMDeatils){
	
	log.info("Inside CouponConsumptionReport() of VMCoupon.js");
	var jsonVar ="";
	var counter=1;
	var regionCounter=0;
	var jsonArray =[];
	var totalVM = VMDeatils.length;
		
		if(VMDeatils != undefined ){
			  var jsonText = JSON.stringify(VMDeatils);
			  var jsonObject = JSON.parse(jsonText);
			
    		  jsonObject.forEach(function(jsonObject) {
    			   // console.log("Name   "+jsonObject.name + "Region   "+jsonObject.region);
    			
			Coupon.aggregate( 
						{$match:{$and:[
						               {resource_name:jsonObject.name},
								
								]}},
										
									{$group : 
		                            	{
		                            		_id : "$item",
		                            		total : {$sum : 1},
		                            		
		                                }
		                            },
		                             { $project: {
		                            	 			total:1,
		                            	 			
		                             			}
		                             },
		                                 function (err, CouponConsumedChartDataALL) {
		                        	        if (err)log.error("Error to find CouponConsumedChartData "); 
		                        	          var DataArray ={};
		                        	          DataArray.name = jsonObject.name;
		                        	          DataArray.region = jsonObject.region;
		                        	  	      DataArray.item = CouponConsumedChartDataALL;
		                        	  	      jsonArray.push(DataArray) ;  
		                      	  	    
		                      	  	       if(counter == totalVM){
		                      	  	    	  res.contentType("json");
		                      	  	    	  res.send({CouponConsumedReport:jsonArray });
		                      	  	        
		                      	  	      }
		                        	  	       counter++;
		                        	  	        
		                         });
					 });
			}//if
	 
};
				





var getCouponCodeAndPrice = function(req,res)
{
	log.info("Inside getCouponCodeAndPrice() of VMCoupon.js");
	var parameter = (req.params.param).split('&');
	var VMName = parameter[0];
	var region = parameter[1];
	var itemName = parameter[2];
	
	Item.find({item:itemName}).exec(function(err,itemDetails){
		if(err){log.error("Problem in getCouponCodeAndPrice() "+err)}
		//console.log("itemDetails   "+itemDetails);
		getCouponCodeByVMName(req,res,VMName,region,itemName,itemDetails);
	});
	
};


var getCouponCodeByVMName = function(req, res, VMName, region, itemName, itemDetails)
{
	log.info("Inside getCouponCodeByVMName() of VMCoupon.js");
	Coupon.find({resource_name:VMName,resource_region:region,item:itemName}).exec(function(err,couponCode){
	  if(err){log.error("Problem in getCouponCodeByVMName  "+err)}
	  // console.log("Couponcode   "+couponCode);
		sendJsonString(req, res, itemDetails, couponCode);
		
	})
	
};


var sendJsonString = function(req, res, itemDetails, couponCode)
{
	log.info("Inside sendJsonString() of VMCoupon.js");
	  var jsonVar ="";
	  var counter=1;
	  var totalVM = couponCode.length;
	  var jsonArray = [];
	  var jsonText = JSON.stringify(couponCode);
	  var jsonObject = JSON.parse(jsonText);
	  
	  if(couponCode != undefined ){
	    jsonObject.forEach(function(jsonObject) {
	    	var DataArray={};
	    	DataArray.code = jsonObject.code;
	    	DataArray.price = itemDetails[0].price;
        
	    	jsonArray.push(DataArray) ;  
	  	       if(counter == totalVM){
	  	    	  //console.log("JsonArray length   "+jsonArray.length);
	  	    	 // console.log("JsonArray --  "+JSON.stringify(jsonArray));
	  	    	  res.contentType("json");
	  	    	  res.send({CouponCodeAndPrice:jsonArray });
	  	        }
	  	     
  	       counter++;
	  });
	}
};

var getCouponConsumed = function(req,res){
	log.info("Inside getCouponConsumed() of VMCoupon.js    "+req.params.parm);
	var param = req.params.param.split("&");
	var vfromDate = param[0];
	var toDate = param[1];
	var vDate = new Date(toDate);
	var vtoDate = vDate.getTime()+86399999;
	var endDate = new Date(vtoDate);
	console.log("From Date  "+new Date(vfromDate));
	console.log("To date   "+endDate);
	Coupon.aggregate( 
			{$match:{$and:[
			               	 {resource_id: { $ne: null}},
							 {consumedon:{$gte:new Date(vfromDate)}},
							 {consumedon:{$lte:endDate}}
							// {genratedon:{$gte:new Date(vfromDate)}},
							 //{genratedon:{$lte:endDate}}
							
							]}},
								
									
								{$group : 
	                            	{
	                            		_id : "$item",
	                            		total : {$sum : 1},
	                            		
	                                }
	                            },
	                             { $project: {
	                            	 			total:1,
	                             			}
	                             },
	                                 function (err, CouponConsumed) {
	                        	        if (err)log.error("Error to find CouponConsumedChartData ");           	           
	                        	           res.contentType("json");
	   		                               res.send({CouponConsumed: CouponConsumed});
	   		                              console.log("CouponConsumed::::"+JSON.stringify(CouponConsumed)); 
	   		                                
	                         });
	
				
};


var getCouponConsumedByRegion = function(req,res){
	log.info("Inside getCouponConsumedByRegion() of VMCoupon.js");
	var param = req.params.param.split("&");
	var region =param[0];
	var vfromDate = param[1];
	var toDate = param[2];
	var vDate = new Date(toDate);
	var vtoDate = vDate.getTime()+86399999;
	var endDate = new Date(vtoDate);
	Coupon.aggregate( 
				{$match:{$and:[
				               	 
				               	 {resource_id: { $ne: null}},
				               	 {resource_region:region},
				               	 {consumedon:{$gte:new Date(vfromDate)}},
								 {consumedon:{$lte:endDate}}
								// {genratedon:{$gte:new Date(vfromDate)}},
								// {genratedon:{$lte:endDate}}
								
								]}},
									
								{$group : 
	                            	{
	                            		_id : "$item",
	                            		total : {$sum : 1},
	                            		
	                                }
	                            },
	                             { $project: {
	                            	 			total:1,
	                             			}
	                             },
	                                 function (err, CouponConsumedByRegion) {
	                        	        if (err)log.error("Error to find getCouponConsumedByRegion ");           	           
	                        	           res.contentType("json");
	   		                               res.send({CouponConsumed: CouponConsumedByRegion});
	   		                               //console.log("getCouponConsumedByRegion::::"+JSON.stringify(CouponConsumedByRegion)); 
	   		                             
	                         });
	
				
};

var getCouponConsumedByVMName = function(req,res){
	log.info("Inside getCouponConsumedByVMName() of VMCoupon.js");
	var param = req.params.param.split("&");
	var VMName = param[0];
	var vfromDate = param[1];
	var toDate = param[2];
	var vDate = new Date(toDate);
	var vtoDate = vDate.getTime()+86399999;
	var endDate = new Date(vtoDate);
	Coupon.aggregate( 
					{$match:{$and:[
					               	 
					               	 {resource_id: { $ne: null}},
					               	 {resource_name:VMName},
					               	 {consumedon:{$gte:new Date(vfromDate)}},
									 {consumedon:{$lte:endDate}}
									 //{genratedon:{$gte:new Date(vfromDate)}},
									//{genratedon:{$lte:endDate}}
									
									]}},
			
								{$group : 
	                            	{
	                            		_id : "$item",
	                            		 total : {$sum : 1},
	                            		
	                                }
	                            },
	                             { $project: {
	                            	 			total:1,
	                             			}
	                             },
	                                 function (err, CouponConsumedByVMName) {
	                        	        if (err)log.error("Error to find getCouponConsumedByVMName ");           	           
	                        	           res.contentType("json");
	   		                               res.send({CouponConsumed: CouponConsumedByVMName});
	   		                               //console.log("CouponConsumedChartData::::"+JSON.stringify(CouponConsumedByVMName)); 
	   		                               
	                         });
	
				
};


exports.setRoutes = function(app) {	
		app.post('/getRegionWithVMNameAndItem', getRegionWithVMNameAndItem);
		app.post('/getCouponConsumedChartDataByVMName/:param', getCouponConsumedChartDataByVMName);
		app.post('/getCouponConsumedChartDataByRegion/:param', getCouponConsumedChartDataByRegion);
		app.post('/getCouponConsumedChartDataAll/:param', getCouponConsumedChartDataAll);
		app.post('/getCouponIssuedChartData/:param', getCouponIssuedChartData);
		app.post('/getCouponCodeAndPrice/:param', getCouponCodeAndPrice);
		app.post('/getCouponConsumedReport', getCouponConsumedReport);
		app.post('/getCouponConsumed/:param', getCouponConsumed);
		app.post('/getCouponConsumedByRegion/:param', getCouponConsumedByRegion);
		app.post('/getCouponConsumedByVMName/:param', getCouponConsumedByVMName);
		
	};

