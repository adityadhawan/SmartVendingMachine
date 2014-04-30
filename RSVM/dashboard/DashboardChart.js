var mongoose = require('mongoose'),
VendingMachine = mongoose.model('VendingMachine'),

Item = mongoose.model('Item'),
Transaction = mongoose.model('Transaction'),
Inventory = mongoose.model('Inventory'),
InventoryStatus = mongoose.model('InventoryStatus'),
Coupon = mongoose.model('Coupon'),
StatusHistory = mongoose.model('StatusHistory'),
VMStatus = mongoose.model('VMStatus'),
MockServiceMgmt = mongoose.model('MockServiceMgmtSchema'),
Coupon = mongoose.model('Coupon'),
ReplenishmentHistory = mongoose.model('ReplenishmentHistory'),
Transaction = mongoose.model('Transaction'),
StockOutHistory = mongoose.model('StockOutHistory'),
Alert = mongoose.model('Alert'),
Goal = mongoose.model('Goal')

var logger= require('./../resource/logger.js');
var log=logger.LOG;



var getVMDispensingChartData = function(req,res)
{
	log.info("Inside getVMDispensingChartData()");
	var now = new Date();
	now.setDate(now.getDate()-60);

	try{
		Transaction.aggregate( 
			{$match:{$and:[
			               	 {time:{$gte:now}},
							 
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
	                                 function (err, VMDispensingChartData) {
	                        	        if (err)log.error("Error in getVMDispensingChartData "+err);           	           
	                        	           res.contentType("json");
	   		                               res.send({VMDispensingChartData: VMDispensingChartData});
	   		                             //  log.info("VMDispensingChartData ::::"+JSON.stringify(VMDispensingChartData)); 
	   		                            //log.info("Exit from getVMDispensingChartData");      
	                         });
    
	}catch(Exception)
	    {
	    	log.error("There is problem in Method: getVMDispensingChartData() File:dashboardChart/  "+Exception)
	     }
};

var getStockReplenshimentChartData = function(req,res)
{
	log.info("Inside getStockReplenshimentChartData()");
	var now = new Date();
	now.setDate(now.getDate()-60);
try{	
		ReplenishmentHistory.aggregate( 
				{$match:{$and:[
			               	 {time:{$gte:now}},
							 
							]}},
	                      
							{$group : 
                        	{
                        		_id : "$itemid",
                        		total : {$sum : 1},
                        		
                            }
                        },
                         { $project: {
                        	 			total:1,
                        	 			
                         			}
                         },
	                                 function (err, StockReplenshimentChartData) {
	                        	        if (err)log.error("Error in getStockReplenshimentChartData "+err);           	           
	                        	           res.contentType("json");
	   		                               res.send({StockReplenshimentChartData: StockReplenshimentChartData});
	   		                               //log.info("getStockReplenshimentChartData ::::"+JSON.stringify(StockReplenshimentChartData)); 
	   		                             
	                         });
}catch(Exception)
 {
	log.error("There is problem in Method: getStockReplenshimentChartData() File:dashboardChart/  "+Exception)
 }
	
};

var getAllUnavailableDataDashboard = function(req,res)
{
	log.info("Inside getAllUnavailableDataDashboard()")
	var now = new Date();
	now.setDate(now.getDate()-30);
	
	VendingMachine
	   .find({ VMStatus_time:{$gte: now}, status:{$ne:'Registered'}})
		 .select('_id status name region VMStatus_time address resourceid')
		 .sort({VMStatus_time:-1} )
		 .exec(function (err, VMDetails) {
		      res.contentType('json');
		      res.send({ VMDetails: VMDetails });
		      log.info("Unavailability  vmdetails    "+VMDetails)
	 });
};

/*
 * 
 */


var getStatusHistoryChartData = function(req,res)
{
	log.info("Inside getStatusHistoryChartData()");
	var now = new Date();
	now.setDate(now.getDate()-60);
try{	
	StatusHistory.aggregate( 
				{$match:{$and:[
			               	 {time:{$gte:now}},
			               	 {errorcode:{$ne:'available'}},
							 
							]}},
	                      
							{$group : 
                        	{
                        		_id : "$time",
                        		total : {$sum : 1},
                        		
                            }
                        },
                         { $project: {
                        	 			total:1,
                        	 			
                         			}
                         },
	                                 function (err, StatusHistoryChartData) {
	                        	        if (err)log.error("Error in getStatusHistoryChartData "+err);           	           
	                        	           res.contentType("json");
	   		                               res.send({StatusHistoryChartData: StatusHistoryChartData});
	   		                              // log.info("getStockReplenshimentChartData ::::"+JSON.stringify(StatusHistoryChartData)); 
	   		                             
	                         });
}catch(Exception)
 {
	log.error("There is problem in Method: getStatusHistoryChartData() File:dashboardChart/  "+Exception)
 }
	
};




var getOutOfStockChartData = function(req, res)
{
	log.info("Inside getOutOfStockChartData()");
	var now = new Date();
	now.setDate(now.getDate()-60);
	
try{	
	StockOutHistory.aggregate( 
				{$match:{$and:[
			               	 {time:{$gte:now}},
			               	 {status: "Out Of Stock"}
							 
							]}},
	                      
							{$group : 
                        	{
                        		_id : "$itemid",
                        		total : {$sum : 1},
                        		
                            }
                        },
                         { $project: {
                        	 			total:1,
                        	 			
                         			}
                         },
	                                 function (err, OutOfStockChartData) {
	                        	        if (err)log.error("Error in getOutOfStockChartData "+err);           	           
	                        	           res.contentType("json");
	   		                               res.send({OutOfStockChartData: OutOfStockChartData});
	   		                              // log.info("getOutOfStockChartData ::::"+JSON.stringify(OutOfStockChartData)); 
	   		                             
	                         });
}catch(Exception)
 {
	log.error("There is problem in Method: getOutOfStockChartData() File:dashboardChart/  "+Exception)
 }
	
};


var getAlertChartData = function(req, res)
{
	log.info("Inside getAlertChartData()");
	var now = new Date();
	now.setDate(now.getDate()-60);
	log.info(now);
try{	
	Alert.aggregate( 
				{$match:{$and:[
			               	 {time:{$gte:now}},
			               	 {name: {$ne:'available'}}
							 
							]}},
	                      
							{$group : 
                        	{
                        		_id : "$name",
                        		total : {$sum : 1},
                        		
                            }
                        },
                         { $project: {
                        	 			total:1,
                        	 			
                         			}
                         },
	                                 function (err, AlertChartData) {
	                        	        if (err)log.error("Error in getAlertChartData "+err);           	           
	                        	           res.contentType("json");
	   		                               res.send({AlertChartData: AlertChartData});
	   		                              // log.info("getAlertChartData ::::"+JSON.stringify(getAlertChartData)); 
	   		                             
	                         });
}catch(Exception)
 {
	log.error("There is problem in Method: getAlertChartData() File:dashboardChart/  "+Exception)
 }
	
};



var getSaleGoalChartData = function(req,res)
{
	log.info("Inside getSaleGoalChartData()");
	try{
		Item.find({},{'_id':0, 'item':1}).exec(function(err,itemName){
			  
			  var removedKey= JSON.stringify(itemName).replace(/\{"item":/g,"");
			  var arrayOfItemsName = removedKey.replace(/\}/g,"");
			  createSaleGoalChartData(req, res, arrayOfItemsName)
			     
		  });
	}catch(Exception)
	 {
		log.error("There is problem in Method: getSaleGoalChartData() File:dashboardChart/  "+Exception)
	 }
	
	};

	
	
var createSaleGoalChartData = function(req, res, arrayOfItemsName)
{
	log.info("Inside createSaleGoalChartData()");
	var now = new Date(); 
	log.info(now);
	
	var WhichQuarter = Math.floor((now.getMonth() / 3));	 
	var Whichyear = now.getFullYear();
	var firstDateOfQuater = new Date(now.getFullYear(), WhichQuarter * 3 - 3, 1);
	var lastDateOfQuater = new Date(now.getFullYear(), WhichQuarter * 3, 1);
	
	
	
try{	
	  	Goal.aggregate( 
				{$match:{$and:[
			               	 //{time:{$gte:now}},
			               	 {itemid:{$in:eval(arrayOfItemsName)}},
			               	 {quater:eval(WhichQuarter)},
			               	 {year:Whichyear.toString()}
							 
							]}},
	                      
							{$group : 
                        	{
                        		_id : "$itemid",
                        		
                        		goal : {$sum : '$goal'},
                        		sale:{$sum:'$sale'}
                        		
                            }
                        },
                         
	                                 function (err, SaleGoalChartData) {
	                        	        if (err)log.error("Error in createSaleGoalChartData "+err);           	           
	                        	           res.contentType("json");
	   		                               res.send({SaleGoalChartData: SaleGoalChartData});
	   		                               //log.info("createSaleGoalChartData ::::"+JSON.stringify(createSaleGoalChartData)); 
	   		                             
	                         });
	 
}catch(Exception)
 {
	log.error("There is problem in Method: createSaleGoalChartData() File:dashboardChart/  "+Exception)
 }
	
};


var getCouponConsumedChartDataDashboard = function(req,res){
		
		var now = new Date();
		now.setDate(now.getDate()-30);
		var month = now.getDay();
		var chartDataArray =[];
		
		log.info("now   "+now);
		log.info("Month   "+month);
		Coupon.aggregate( 
				{$match:{$and:[
				               	 {resource_name: { $ne: null}},
								 {consumedon:{$gte:now}},
								
								]}},
									{$group : 
		                            	{
										_id: {
						                    item: "$item",
						                    month: {$month: "$consumedon"}
						                  
						                },
		                            		
						                total : {$sum : 1}
		                            		
		                                }
										
		                            },
		                            
		                             { $project: {
		                            	 			total:1,
		                            	 			
		                             			}
		                             },
		                                 function (err, CouponConsumedChartData) {
		                        	        if (err)log.error("Error to find CouponConsumedChartData ");           	           
		                        	           res.contentType("json");
		   		                               //res.send({CouponConsumedChartDataAll: CouponConsumedChartDataALL});
		   		                               var no =new Date();
		                        	           chartDataArray.push({monthData:CouponConsumedChartData});
		                        	          
		   		                             // log.info("CouponConsumedChartData::::"+JSON.stringify(CouponConsumedChartDataALL)); 
		                        	           getLastTwoMonthDataChart(req, res, chartDataArray);
		   		                                
		                         });
		
					
	};
	

var getLastTwoMonthDataChart = function(req,res, chartDataArray){
		var oneMonthBack = new Date();
		var twoMonthBack = new Date();
		
		
		twoMonthBack.setDate(twoMonthBack.getDate()-60);
		oneMonthBack.setDate(oneMonthBack.getDate()-30);
		var month = twoMonthBack.getMonth();
		
		Coupon.aggregate( 
				{$match:{$and:[
				               	 {resource_name: { $ne: null}},
								 {consumedon:{$gte:oneMonthBack}},
								 {consumedon:{$lte:twoMonthBack}},
								
								]}},
									{$group : 
		                            	{
		                            		_id :
		                            		   { 
			                            			 item:"$item",
			                            		     month: {$month: "$consumedon"}
		                            		
		                                       },
											total : {$sum : 1}
		                            	}    
		                            },
		                             { $project: {
		                            	 			total:1,
		                             			}
		                             },
		                                 function (err, CouponConsumedChartDataALL) {
		                        	        if (err)log.error("Error to find CouponConsumedChartData ");           	           
		                        	           //res.contentType("json");
		                        	           chartDataArray.push({monthData:CouponConsumedChartDataALL});
		   		                               //res.send({CouponConsumedChartDataAll: chartDataArray});
		   		                               //log.info("CouponConsumedChartData::::"+JSON.stringify(chartDataArray)); 
		                        	           getLastThreeMonthDataChart(req, res, chartDataArray);
		   		                    });
					
	};
	
	
	var getLastThreeMonthDataChart = function(req,res, chartDataArray){
		var threeMonthBack = new Date();
		var twoMonthBack = new Date();
		threeMonthBack.setDate(threeMonthBack.getDate()-90);
		twoMonthBack.setDate(twoMonthBack.getDate()-60);
		Coupon.aggregate( 
				{$match:{$and:[
				               	 {resource_name: { $ne: null}},
								 {consumedon:{$gte:threeMonthBack}},
								 {consumedon:{$lte:twoMonthBack}}
								
								]}},
									{$group : 
		                            	{
		                            		_id :
		                            		   { 
			                            			 item:"$item",
			                            		     month: {$month: "$consumedon"}
		                            		
		                                       },
											total : {$sum : 1}
		                            	}    
		                            },
		                             { $project: {
		                            	 			total:1,
		                             			}
		                             },
		                                 function (err, CouponConsumedChartDataALL) {
		                        	        if (err)log.error("Error to find CouponConsumedChartData ");           	           
		                        	           res.contentType("json");
		                        	           chartDataArray.push({monthData:CouponConsumedChartDataALL});
		   		                               res.send({CouponConsumedChartDataAll: chartDataArray});
		   		                              // log.info("CouponConsumedChartData::::"+JSON.stringify(chartDataArray)); 
		   		                                
		                         });
					
	};
	
	
	
	var getFaultChartData = function(req, res)
	{
		var now = new Date();
		now.setDate(now.getDate()-30);
		try{
			StatusHistory.aggregate( 
					{$match:{$and:[
				               	 {errorcode: { $ne:'available'}},
								 {time:{$gte:now}}
								
								]}},
									{$group : 
		                            	{
										_id: {
						                    //errorcode: "$errorcode",
											year       : { $year       : '$time' },
							                month      : { $month      : '$time' },
							                day 	   : { $dayOfMonth : '$time' },
						                  
						                },
		                            	total : {$sum : 1}
		                            	}
									},
		                            
		                            {$project: {
		                                	 	date: {
		                                        day:"$_id.day",
		                                        month:"$_id.month",
		                                        year:"$_id.year"
		                                       
		                               	},
		                               	total:1,
		                               	_id:0
		                               	
		                            }
		                               	
		                            },{$sort: {"date.day":1}},
		                                 function (err, FaultChartData) {
		                        	        if (err)log.error("Error to find FaultChartData ");           	           
		                        	           res.contentType("json");
		   		                               res.send({FaultChartData: FaultChartData});
		   		                              
		                        	          	                        	          
		   		                             // log.info("CouponConsumedChartData::::"+JSON.stringify(CouponConsumedChartDataALL)); 
		                        	          
		                         });
		}catch(Exception)
		{
			log.error("There is some problem in getFaultChartData()  "+Exception)
		}
					
	};
	
	
	
	var getCouponConsumptionTopFiveData = function(req,res)
	{
		log.info("Inside getCouponConsumptionTopFiveData()");
		var now = new Date();
		now.setDate(now.getDate()-30);
	try{	
			Coupon.aggregate( 
					{$match:{$and:[
										{resource_name: { $ne: null}},
										{consumedon:{$gte:now}},
										
								]}},
		                      
								{$group : 
	                        	{
	                        		_id : "$resource_region",
	                        		total : {$sum : 1},
	                        		
	                            }
	                        },
	                         { $project: {
	                        	 			total:1,
	                        	 			
	                         			}
	                         },{$sort: {"total":-1}},
		                                 function (err, CouponConsumptionTopFiveData) {
		                        	        if (err)log.error("Error in getCouponConsumptionTopFiveData "+err);           	           
		                        	           res.contentType("json");
		   		                               res.send({CouponConsumptionTopFiveData: CouponConsumptionTopFiveData});
		   		                               //log.info("getCouponConsumptionTopFiveData ::::"+JSON.stringify(CouponConsumptionTopFiveData)); 
		   		                             
		                         });
	}catch(Exception)
	 {
		log.error("There is problem in Method: getCouponConsumptionTopFiveData() File:dashboardChart/  "+Exception)
	 }
		
		
	};
	

	

exports.setRoutes = function(app) {	
	app.post('/getVMDispensingChartData', getVMDispensingChartData);
	app.post('/getStockReplenshimentChartData', getStockReplenshimentChartData);
	app.post('/getStatusHistoryChartData', getStatusHistoryChartData);
	app.post('/getOutOfStockChartData', getOutOfStockChartData);
	app.post('/getAlertChartData', getAlertChartData);
	app.post('/getSaleGoalChartData', getSaleGoalChartData);
	app.post('/getCouponConsumedChartDataDashboard', getCouponConsumedChartDataDashboard);
	app.post('/getFaultChartData', getFaultChartData);
	app.post('/getAllUnavailableDataDashboard', getAllUnavailableDataDashboard);
	app.post('/getCouponConsumptionTopFiveData', getCouponConsumptionTopFiveData);
	
	
};


