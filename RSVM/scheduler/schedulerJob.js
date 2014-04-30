var schedule = require('node-schedule');
var prop = require('../util/loadproperties');
//var loadVMCache = require('../admin/Test')('rit');

//var GoalSaleJob = require('./scheduler/goalsalejob');
var GoalSaleJob = require('./goalsalejob');

var interval = null;
var interval1 = null;

var now = new Date()
var job= schedule.scheduleJob(now, function(){
	console.log('The scheduler is going to call GoalSaleJob .');
    
    //GoalSaleJob.getQuaterSaleData();
	//interval1 = setInterval(loadVMStatusCache,9000);
    interval = setInterval(heartBeatQuaterSaleData, 7862400);
    
});


var heartBeatQuaterSaleData = function() {
   GoalSaleJob.getQuaterSaleData();
  };
  
  
  
var loadProperties = function()
{
	
	prop.loadProperties();
	};
	
	
	
	/*var loadVMStatusCache = function()
	{
		console.log("Ritesh");
		//loadVMCache.getVMStatus("ABC");
		};*/