
var mongoose = require('mongoose'),
   Transaction = mongoose.model('Transaction'),
   Goal = mongoose.model('Goal')

   
   
   
module.exports.getQuaterSaleData = function()
	{
	console.log("Inside getQuaterSaleData()");
	
		var now = new Date(); 
		//console.log(now);
		
		
		var WhichQuarter = Math.floor((now.getMonth() / 3));	 
		var Whichyear = now.getFullYear();
		var firstDateOfQuater = new Date(now.getFullYear(), WhichQuarter * 3 - 3, 1);
		var lastDateOfQuater = new Date(now.getFullYear(), WhichQuarter * 3, 1);
		
		console.log("firstDateOfQuater  "+firstDateOfQuater);
		console.log("lastDateOfQuater  "+lastDateOfQuater);
		
		getQuarterTransactionData(firstDateOfQuater, lastDateOfQuater,WhichQuarter,Whichyear)
		
	}
	
	var getQuarterTransactionData = function(firstDateOfQuater, lastDateOfQuater,WhichQuarter,Whichyear)
	{
		console.log("Inside getQuaterTransactionData()");
		
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
	console.log("Inside upadteSaleValue")
	
	 var jsonText = JSON.stringify(jsonData[0]);
	 var jsonObject = JSON.parse(jsonText);
	 var sArr=jsonObject.length-2;
	 
	 var Quarteryear = jsonData[1].year;
	 var quarter = jsonData[2].quarter;
	 
	  
	  if(jsonData != undefined ){
	    jsonObject.forEach(function(jsonObject) {
	    	
	    	var internalJsonText = JSON.stringify(jsonObject)
	    	var internalJsonObject = JSON.parse(internalJsonText);
	    	var itemName = jsonObject._id.itemName;
	    	var total = jsonObject.total;
	    	var resourceName = jsonObject._id.resourceName;
	    	
	    	Goal.find({itemid:itemName,year:Quarteryear,quater:quarter,resource_id:resourceName}).exec(function(err,goalDetails){
	    		if(err){console.error("There is some problem in goalDeatils")}
	    		
	    		if(goalDetails[0]!= undefined  ){
		    		Goal.update({_id : goalDetails[0]._id}, {$set : {sale : total}
		    		}, function(err, numberAffected) {
		    			if (err)
		    				console.log("Error in update upadteSaleValue()" + err);
		    			    console.log("numberAffected in upadteSaleValue() " + numberAffected);
		    		 });
	    		}
	    		
	    	});
	    	
	    	
	  });
	}
	
	}