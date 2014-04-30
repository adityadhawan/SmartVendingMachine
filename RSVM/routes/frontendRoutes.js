var prop = require('../util/loadproperties');
var mongoose = require('mongoose'),

 url = require('url') ,
  //routes = require('../routes'),
  // async = require('async'),
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
   StockOutHistory = mongoose.model('StockOutHistory'),
   Alert = mongoose.model('Alert'),
   Goal = mongoose.model('Goal'),
  
   config = require('./../resource/config');
var dateformate1 = require('dateformat');


var logger= require('./../resource/logger.js');

var log=logger.LOG;

var dashboard = function(req, res){
    if (!req.session.user) { return res.redirect('/'); }
    Store.find({managers: req.session.user._id}, function(err, stores) {
        if (err) return index.errResponse(err, req, res);
        console.log("user" +req.session.user._id);
		res.render('dashboard', {
            sitename: config.sitename,
            stores: stores,
			user: req.session.user
        });
    });
};

var generateReport = function(req, res) {
	if (!req.session.user) { return res.redirect('/'); }
	    Store.find({managers: req.session.user._id}, function(err, stores) {
        if (err) return index.errResponse(err, req, res);
		res.render('generate_report', {
            sitename: config.sitename,
            stores: stores,
			user: req.session.user
        });
    });
};

var alarmConfigNoID = function (req, res) {
	if (!req.session.user) { return res.redirect('/'); }
	    Store.find({managers: req.session.user._id}, function(err, stores) {
        if (err) return index.errResponse(err, req, res);
		res.render('alarm_config_noid', {
            sitename: config.sitename,
            stores: stores,
			user: req.session.user
        });
    });	
};

var alarmConfig = function(req, res) {
    if (!req.session.user) { return res.redirect('/'); }
	var id = req.params.id;
	Store.findOne({_id: id}, function(err, store) {
		if (err) return index.errResponse(err, req, res);
		var alerts = {};
        async.parallel([
            function(callback) {
                TemperatureAlert.find({
                        store: store._id,
                        user: req.session.user._id
                    }).populate('user').exec(function(err, tempalerts) {
                    alerts['temperature'] = tempalerts;
                    callback(err);
                });
            },
            function(callback) {
                CleaningAlert.find({
                        store: store._id,
                        user: req.session.user._id
                    }).populate('user').exec(function(err, cleanalerts) {
                    alerts['cleaning'] = cleanalerts;
                    callback(err);
                });
            }
        ], function(err) {
            if (err) return index.errResponse(err, req, res);
			res.render('alarm_config', {
				sitename: config.sitename,
				store: store,
				user: req.session.user,
				alerts: alerts
			});
        });

	});
};

var configReport = function(req, res) {
    if (!req.session.user) { return res.redirect('/'); }
	res.render('config_report', {
		sitename: config.sitename
	});	
};

/*var storeDetail = function(req, res){
    if (!req.session.user) { return res.redirect('/'); }
    var id = req.params.id;
    Store.findOne({_id: id}, function(err, store) {
        if (err) return index.errResponse(err, req, res);
        Unit.find({store: store._id})
                .populate('flavors.left', 'name')
                .populate('flavors.right', 'name')
                .exec(function(err, units) {
            if (err) return index.errResponse(err, req, res);
            res.render('store_detail', {
                sitename: config.sitename,
                store: store,
                units: units
            });
        });
    });
};*/

/*var unitDetail = function(req, res) {
    if (!req.session.user) { return res.redirect('/'); }
    var id = req.params.id;
    Unit.findOne({_id: id})
                .populate('flavors.left', 'name')
                .populate('flavors.right', 'name')
                .populate('store')
                .exec(function(err, unit) {
        if (err) return index.errResponse(err, req, res);
        res.render('unit_detail', {
            sitename: config.sitename,
            unit: unit
        });
    });
};
*/
/*var storeAlerts = function(req, res){
    if (!req.session.user) { return res.redirect('/'); }
    var id = req.params.id;
    Store.findOne({_id: id}, function(err, store) {
        if (err) return index.errResponse(err, req, res);
        var alerts = {};
        async.parallel([
            function(callback) {
                TemperatureAlert.find({
                        store: store._id,
                        user: req.session.user._id
                    }).populate('user').exec(function(err, tempalerts) {
                    alerts['temperature'] = tempalerts;
                    callback(err);
                });
            },
            function(callback) {
                CleaningAlert.find({
                        store: store._id,
                        user: req.session.user._id
                    }).populate('user').exec(function(err, cleanalerts) {
                    alerts['cleaning'] = cleanalerts;
                    callback(err);
                });
            }
        ], function(err) {
            if (err) return index.errResponse(err, req, res);
            res.render('store_alerts', {
                sitename: config.sitename,
                store: store,
                alerts: alerts
            });
        });
    });
};

var storeDebug = function(req, res) {
    if (!req.session.user) { return res.redirect('/'); }
    var id = req.params.id;
    Store.findOne({_id: id}, function(err, store) {
        if (err) return index.errResponse(err, req, res);
        res.render('debug', {
            sitename: config.sitename,
            store: store
        });
    });
};*/

var loginPage = function(req, res) {
    if (req.session.user) { return res.redirect('/dashboard'); }
    res.render('login', {
        sitename: config.sitename,
        err: ''
    });
};
/**
 * Render main page
 */
var index = function(req, res){
	//getCouponConsumptionTopFiveData(req,res);
	
	res.render('VendingMachine.html');
	};

var getCouponConsumptionTopFiveData = function(req,res)
{
	
	console.log("@@@@@@  "+prop.getProperties("beverage"));
	console.log("Inside getCouponConsumptionTopFiveData()");
	var now = new Date();
	now.setDate(now.getDate()-60);
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
	                        	        if (err)console.error("Error in getCouponConsumptionTopFiveData "+err);           	           
	                        	           res.contentType("json");
	   		                               res.send({CouponConsumptionTopFiveData: CouponConsumptionTopFiveData});
	   		                               //console.log("getCouponConsumptionTopFiveData ::::"+JSON.stringify(CouponConsumptionTopFiveData)); 
	   		                             
	                         });
}catch(Exception)
 {
	console.error("There is problem in Method: getCouponConsumptionTopFiveData() File:dashboardChart/  "+Exception)
 }
	
	
};
	
	
	
	var getQuaterSaleData = function(req,res)
	{
		var now = new Date(); 
		console.log(now);
		console.log("-----  "+new Date(2014, 03, 11, 16, 06, 0));
		
		var WhichQuarter = Math.floor((now.getMonth() / 3));	 
		var Whichyear = now.getFullYear();
		var firstDateOfQuater = new Date(now.getFullYear(), WhichQuarter * 3 - 3, 1);
		var lastDateOfQuater = new Date(now.getFullYear(), WhichQuarter * 3, 1);
		
		console.log("firstDateOfQuater  "+firstDateOfQuater);
		console.log("lastDateOfQuater  "+lastDateOfQuater);
		
		getQuarterTransactionData(req,res, firstDateOfQuater, lastDateOfQuater,WhichQuarter,Whichyear)
		
	}
	
	var getQuarterTransactionData = function(req,res, firstDateOfQuater, lastDateOfQuater,WhichQuarter,Whichyear)
	{
		var jsonData = [];
		try{
			Transaction.aggregate( 
				{$match:{$and:[
				               	 {time:{$gte:firstDateOfQuater}},
				               	 {time:{$lte:lastDateOfQuater}},
								 
								]}},
		                    	{$group : 
                            	{
								_id: {
				                    
									itemName       		: "$item",
									resourceName     :  "$resource_id" 
					                
				                  
				                },
                            	total : {$sum : 1}
                            	}
							},
                            
                            {$project: {
                                	 	Txn: {
                                        itemName:"$_id.item",
                                        resourceName:"$_id.resource_id",
                                       
                                       
                               	},
                               	total:1
                               	
                               	
                            }
                               	
                            },
		                                 function (err, QuarterTransactionData) {
		                        	        if (err)console.error("Error in getQuarterTransactionData "+err); 
		                        	        
		                        	        jsonData.push(QuarterTransactionData);
		                        	        jsonData.push({year:Whichyear});
		                        	        jsonData.push({quarter:WhichQuarter});
		                        	        
		                        	        //res.contentType("json");
		   		                            // res.send({QuarterTransactionData: jsonData});
		                        	       if(QuarterTransactionData.length>0){
		                        	    	   upadteSaleValue(jsonData);
		                        	       }else
		                        	    	   {
		                        	    	     console.log("There is no data to update Goal");
		                        	    	   }
		   		                           //console.log("getQuarterTransactionData ::::"+JSON.stringify(jsonData)); 
		   		                            
		                         });
	    
		}catch(Exception)
		    {
		    	console.error("There is problem in Method: getQuarterTransactionData() File:dashboardChart/  "+Exception)
		     }
					
	}
	
var upadteSaleValue = function(jsonData)
{
	
	 var jsonText = JSON.stringify(jsonData[0]);
	  var jsonObject = JSON.parse(jsonText);
	   
	  console.log("length   "+jsonObject.length);
	 
	  var sArr=jsonObject.length-2;
	  
	 
	  //console.log("===  "+jsonData[sArr].year);
	  var Quarteryear = jsonData[1].year;
	  var quarter = jsonData[2].quarter;
	  console.log("year   "+Quarteryear),
	  console.log("quarter   "+quarter);
	
	  
	  if(jsonData != undefined ){
	    jsonObject.forEach(function(jsonObject) {
	    	
	    	var internalJsonText = JSON.stringify(jsonObject)
	    	var internalJsonObject = JSON.parse(internalJsonText);
	    	console.log("itemName::: "+jsonObject._id.itemName);
	    	console.log("ResourceName::::: "+jsonObject._id.resourceName);
	    	console.log("Total     "+jsonObject.total);
	    	var itemName = jsonObject._id.itemName;
	    	var total = jsonObject.total;
	    	var resourceName = jsonObject._id.resourceName;
	    	
	    	Goal.find({itemid:itemName,year:Quarteryear,quater:quarter,resource_id:resourceName}).exec(function(err,goalDeatils){
	    		if(err){console.error("There is some problem in goalDeatils")}
	    		
	    		console.log("id     "+goalDeatils );
	    		
	    		Goal.update({_id : goalDeatils[0]._id}, {$set : {sale : total}
	    		}, function(err, numberAffected) {
	    			if (err)
	    				console.log("Error in update updateVMByInventoryStatus" + err);
	    			    console.log("numberAffected in updateVMByInventoryStatus " + numberAffected);
	    		 });
	    		
	    	});
	    	
	    	
	  });
	}
	
	}
	
	/**
	 * Return the starting quarter date for a given date
	 * 
	 * @param {Date} inputDate
	 * @return {Date}
	 */
	function getQuarterStartDate(inputDate) {
		if(!inputDate) { return null; }
		var inDate = new Date(inputDate);
		var mo = inDate.getMonth() + 1; //remember JS months are 0-11!
		var yr = inDate.getFullYear();
		if(mo > 9) {
			return new Date(yr, 10, 1);
		} else if (mo > 6) {
			return new Date(yr, 7, 1);
		}  else if (mo > 3) {
			return new Date(yr, 4, 1);
		} else {
			return new Date(yr, 1, 1);
		}
	}


	/**
	 * Return the ending quarter date for a given date
	 * 
	 * @param {Date} inputDate
	 * @return {Date}
	 */
	function getQuarterEndDate(inputDate) {
		if(!inputDate) { return null; }
		var inDate = new Date(inputDate);
		var mo = inDate.getMonth() + 1; //remember JS months are 0-11!
		var yr = inDate.getFullYear();
		if(mo > 9) {
			return new Date(yr, 12, 31);
		} else if (mo > 6) {
			return new Date(yr, 9, 30);
		}  else if (mo > 3) {
			return new Date(yr, 6, 30);
		} else {
			return new Date(yr, 3, 31);
		}
	}

	/**
	 * Return a search string properly formatted for the start/end quarter dates
	 * 
	 * @param {Date} inputDate
	 * @return {String}
	 */
	function getQuarterRange(inputDate) {
		if(!inputDate) { return null; }
		var sDate = getQuarterStartDate(inputDate);
		var eDate = getQuarterEndDate(inputDate);
		
		console.log("============ "+sDate);
		console.log("---------------- "+eDate);
		//var theFormat = i18n.getDefaultDateFormat();
		/*var theFormat = dateformate1.i18n;
		
		if(sDate && eDate) {
			return dateformate1.dateFormat(sDate,theFormat) +
			"..." + dateformate1.dateFormat(sDate,theFormat) + "|" + theFormat;
		} else {
			return null;
		}*/
	}
	
	
	var getFaultChartData = function(req, res)
	{
		var now = new Date();
		now.setDate(now.getDate()-60);
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
							                day : { $dayOfMonth : '$time' },
						                  
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
		                        	        if (err)console.error("Error to find FaultChartData ");           	           
		                        	           res.contentType("json");
		   		                               res.send({FaultChartData: FaultChartData});
		   		                              
		                        	          	                        	          
		   		                             // console.log("CouponConsumedChartData::::"+JSON.stringify(CouponConsumedChartDataALL)); 
		                        	          
		                         });
		}catch(Exception)
		{
			console.error("There is some problem in getFaultChartData()  "+Exception)
		}
					
	};
	
	
	
	
	var getVMDispensingChartData = function(req,res)
	{
		console.log("Inside getVMDispensingChartData()");
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
		                        	        if (err)console.error("Error in getVMDispensingChartData "+err);           	           
		                        	           res.contentType("json");
		   		                               res.send({VMDispensingChartData: VMDispensingChartData});
		   		                               console.log("VMDispensingChartData ::::"+JSON.stringify(VMDispensingChartData)); 
		   		                            //log.info("Exit from getVMDispensingChartData");      
		                         });
	    
		}catch(Exception)
		    {
		    	console.error("There is problem in Method: getVMDispensingChartData() File:dashboardChart/  "+Exception)
		     }
	};

var getLastTwoMonthDataChart = function(req,res, chartDataArray){
		var oneMonthBack = new Date();
		var twoMonthBack = new Date();
		
		
		twoMonthBack.setDate(twoMonthBack.getDate()-60);
		oneMonthBack.setDate(oneMonthBack.getDate()-30);
		var month = twoMonthBack.getMonth();
		console.log("twoMonthBack   "+twoMonthBack);
		console.log("oneMonthBack   "+oneMonthBack);
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
		                        	        if (err)console.error("Error to find CouponConsumedChartData ");           	           
		                        	           //res.contentType("json");
		                        	           chartDataArray.push({monthData:CouponConsumedChartDataALL});
		   		                               //res.send({CouponConsumedChartDataAll: chartDataArray});
		   		                               //console.log("CouponConsumedChartData::::"+JSON.stringify(chartDataArray)); 
		                        	           getLastThreeMonthDataChart(req, res, chartDataArray);
		   		                    });
					
	};
	
	var getLastThreeMonthDataChart = function(req,res, chartDataArray){
		var threeMonthBack = new Date();
		var twoMonthBack = new Date();
		
		
		threeMonthBack.setDate(threeMonthBack.getDate()-90);
		twoMonthBack.setDate(twoMonthBack.getDate()-60);
		
		console.log("twoMonthBack   "+twoMonthBack);
		console.log("threeMonthBack   "+threeMonthBack);
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
		                        	        if (err)console.error("Error to find CouponConsumedChartData ");           	           
		                        	           res.contentType("json");
		                        	           chartDataArray.push({monthData:CouponConsumedChartDataALL});
		   		                               res.send({CouponConsumedChartDataAll: chartDataArray});
		   		                              // console.log("CouponConsumedChartData::::"+JSON.stringify(chartDataArray)); 
		   		                                
		                         });
		
					
	};


	
	


/**  All Region,Location,VendingMachine and Items are populated and send details to render the page.
 * 
 */

var VMDispensing = function(req, res){
	log.info("Enter into VMDispensing");
	
	Inventory.findOne(function (err, doc) {
		  console.log("============="+doc) // [ObjectId('xxx'), ObjectId('yyy')]
		  console.log("============="+doc.units)
		  doc.populate('_id', function (err, doc) {
		    console.log("-----------------"+doc); // [{ _id: ObjectId('xxx'), name: 'populated' }, { _id: ObjectId('yyy') }]
		    //console.log("^^^^^^^^^^^^^^^^^^^^"+doc.populated('resource_id')) // [ObjectId('xxx'), ObjectId('yyy')]
		  });
		});

	
	/*Inventory
	.find()
	.populate({ path: 'resource_id', select: 'name' })

	  //.populate('resource_id')//,'region name location'
	  //.populate('itemid','item')
       .exec(function (err, VMDetails) {
    	   if(err)
    		   console.log("Error in populate   "+err);
	      res.contentType('json');
	      res.send({ VMDetails: VMDetails });
	     console.log("Data111111:::::"+VMDetails);
	      log.info("Exit from VMDispensing");
	      
	});*/
	
};





/**
 * This method is used for ajax call for Region name ,Location Name,VendingMachine Name.
 * Get array of ObjectIds of vendingmachine model, on the basis of Location,Region,VM Name and 
 * pass ObjectIDs to Inventor Model. 
 */
var getLocationByCity= function(req, res){
	console.log("Get City::::;"+req.params.param);
	log.info("Enter into getLocationByCity");
	var paramArray  = (req.params.param).split("=");
	if(paramArray[0] == "Region")
	{
		 var rule = ".find({region:'"+paramArray[1]+"'})";
	}
	else if(paramArray[0] == "Location")
	{
		 var rule = ".find({location:'"+paramArray[1]+"'})";
	}
	else if(paramArray[0] == "VMName"){
		var rule = ".find({_id:'"+paramArray[1]+"'})";
	}
	var value = "Mumbai"
	var rule = ".find({region:'"+value+"'})";
	
	var query = "VendingMachine"+rule+".select('_id')";
	//console.log(query);
	eval(query).exec(function (err, VMDetails) {
		
	  	 var removeId = JSON.stringify(VMDetails).replace(/\{"_id":/g,"");
	  	 
	     var arrayOfObjectIds = removeId.replace(/\}/g,"");
	    
	     
	  	Inventory
		.find()
		.populate({
					  path:'resource_id',
					  match: { _id:{$in:eval(arrayOfObjectIds)}},
					  select:'region name location _id'
				})
		
		      .populate('itemid','item')
		      .exec(function (err, VMDetails) {
		      res.contentType('json');
		      res.send({ VMDetails: VMDetails });
		      console.log("Data:::::"+VMDetails);
		});
	  	log.info("Exit from getLocationByCity");
	});
	 
};

/*var VMDispensing= function(req, res){
	var value = "Mumbai"
	var rule = ".find({region:"+value+"})";
	VendingMachine 
	//.find({region:"Mumbai"})
	.select('_Id')
	   .exec(function (err, VMDetails) {
	     
	  	 var removeId = JSON.stringify(VMDetails).replace(/\{"_id":/g,"");
	  	console.log("without:::::"+removeId);
	  	var arrayOfObjectIds = removeId.replace(/\}/g,"");
	  	console.log("arrayOfObjectIds:::::"+arrayOfObjectIds);
	  	 res.contentType('json');
	      res.send({ Ids: arrayOfObjectIds});
	});
	
};*/
//getVMDispensingDetailsByCityId
/*var VMDispensing5 = function(req, res){
	Inventory
	.find()
	.populate({
				  path:'resource_id',
				 //match: { _id:{$in:}},
				  match: { _id:{$in:["52fdbc8d6ea953739d61552a","52fdbc8d6ea953739d61552b","52fdbc8d6ea953739d61552c","52fdbc926ea953739d61552d"]}},
				 
				  select:'region name location _id'
			})
	
	 .populate('itemid','item')
	   .exec(function (err, VMDetails) {
	      res.contentType('json');
	      res.send({ VMDetails: VMDetails });
	      console.log("Data:::::"+VMDetails);
	});
	
};*/

var getVMDispensingChartData1 = function(req,res){
	console.log(req.params.param);
	log.info("Enter into getVMDispensingChartData");
	Transaction.aggregate( 
	                        {$match:
	                        	
	                           {$and:eval(req.params.param)}},
	                      
	                            {$group : {_id : "$item", total : {$sum : 1}}},
	                             { $project: { "item":1,"total":1}},
	                                 function (err, VMChartData) {
	                        	        if (err)console.log("Error################");           	           
	                        	          // res.contentType("json");
	   		                               res.send({chartData: VMChartData});
	   		                               console.log("Char Data::::"+JSON.stringify(VMChartData)); 
	   		                            log.info("Exit from getVMDispensingChartData");      
	                         });
				};
				




				
				
exports.setRoutes = function(app) {
	app.get('/', index);
	app.get('/dashboard', dashboard);
	app.post('/VMDispensing', VMDispensing);
	app.post('/getVMDispensingChartData/:param', getVMDispensingChartData);
	app.post('/getLocationByCity/:param', getLocationByCity);
	
   // app.get('/alerts/:id/', storeAlerts);
   // app.get('/generatereport', generateReport);
   // app.get('/alarmcfg/:id/', alarmConfig);
   // app.get('/alarmcfg', alarmConfigNoID);
   // app.get('/configreport', configReport);
};
