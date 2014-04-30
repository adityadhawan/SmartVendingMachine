 	var request  = require('../node_modules/bugswarm-prt/node_modules/superagent'),
     mongoose = require('mongoose'),
     VendingMachine = mongoose.model('VendingMachine'),
     Transaction = mongoose.model('Transaction'),
     Item = mongoose.model('Item'),
     async = require('async'),
     config = require('../resource/config'),
    //Data Model variable
     TxnId = mongoose.model('TxnId'),
     Inventory = mongoose.model('Inventory'),
     ReplenishmentHistory = mongoose.model('ReplenishmentHistory'),
     StockOutHistory = mongoose.model('StockOutHistory'),
     StatusHistory = mongoose.model('StatusHistory'),
     VendingMachineDetail = mongoose.model('VendingMachineDetail'),
     Alert = mongoose.model('Alert'),
     AlertConfig = mongoose.model('AlertConfig'),
     Coupon = mongoose.model('Coupon'),
     Goal = mongoose.model('Goal'),
     AlertConfig = mongoose.model('AlertConfig'),
     VMStatus = mongoose.model('VMStatus'),
     InventoryStatus = mongoose.model('InventoryStatus');
     alert = require('../services/Alert'),
     swarmservice = require('./SwarmService'),
     ticketserviceMgmt = require('../services/TicketServiceMgmt')
     
module.exports.swarmMessageControler = function(message)
{
 		
	 if(message != null){
			
		 console.log("######### swarmMessageControler call ###########");
		 console.log("Message:::   "+JSON.stringify(message.payload));
		 
		 if('Units_Replenished' in message.payload && message !=null  )
			 {
				 console.log("Products Got");
				 saveAndUpdateInventory(message);
			   
			 }
		 else if('Sale_Amount' in message.payload || 'Coupon_Code'in message.payload)
			{
			 
			 	saveVMDespensingDetails(message);
			}
		 else if('Error_Type' in message.payload)
			{
			
			 swarmservice.saveAlert(message,message.payload.Error_Type);
			
			}
	}
	 
	 };
	 
   /**
    * 
    */  
	 
	 module.exports.isResourceNew = function(resourceId,statusType){
		 if(resourceId.length > 0 && statusType.length > 0){
				 VendingMachine.find({resourceid:resourceId},function(err, VMDetails){
					 if(err) console.log("Error in isResourceNew "+err);
				
					 if(VMDetails.length == 0)
					  {  
						 console.log("New Vending Machine Got  "+resourceId );
						 getAndSaveResourceDetails(resourceId,statusType);
					  }	 
		 });
	 }else{console.log("resourceId or statusType is not available ")}
	 
 }
 
 
 
var getAndSaveResourceDetails = function(resourceId,statusType)
{
	var vmDetails  
	var location
	var region
	var vlatitude
	var vlongitude
	//console.log("inside getAndSaveResourceDetails  "+resourceId);
	    request
	        .get(config.resourceinfourl+resourceId)
	        .set(config.header)
	        .end(function(res) {	       
	        	//console.log("res     "+JSON.parse(res.header));
	            var vmDetails = JSON.parse(res.text);
	           // console.log("VmDetails:::::     "+JSON.stringify(vmDetails));
	           
	          if(vmDetails.position != undefined ){
	            	var locreg = (vmDetails.name).split('_');
	            	
	              if(vmDetails.position == undefined)
	            	   vlatitude = null;
	              else
	            	  vlatitude = vmDetails.position.latitude; 
	              if(vmDetails.position == undefined)
	            	   vlongitude= null;
	              else
	            	  vlongitude = vmDetails.position.longitude; 
	           
	            
	            new VendingMachine({
	       		 	 resourceid: resourceId	,
		       		 swarmid:    config.swarm.swarms,//"84f8724feda4acc593c6a4cda9d9b26de024c69f",
		       	     latitude :  vlatitude,//vmDetails.position.latitude,
		       	     longitude : vlongitude,//vmDetails.position.longitude,
		        	 region :    locreg[0].trim(),//vmDetails.Region,
		        	 name :      vmDetails.name,
		        	 location :  locreg[1].trim(),//vmDetails.Location,
		        	 status:   	 'Registered',
		        	 address:    vmDetails.description,
		        	 VMStatus_time:       Date.now(),
		        	 InventoryStatus_time: Date.now()
		        	 
	       	     })
	       		     .save( function( err, VendingMachine ){
	       		       if (err) console.log("Error in getAndSaveResourceDetails "+err);
	       		     
	       		       //This is used for Vendingin Machine with Items.
	       		    
	       		    new VendingMachineDetail({
		       		 	 resourceid: resourceId	,
			       		 swarmid:   config.swarm.swarms,//"84f8724feda4acc593c6a4cda9d9b26de024c69f",
			       	     latitude :  vmDetails.Latitude,
			       	     longitude : vmDetails.Longitude,
			        	 region :    vmDetails.Region,
			        	 name :      vmDetails.name,
			        	 location :  vmDetails.Location,
			        	 status:   	 statusType,
			        	 address:    vmDetails.description,
			        	 items:      ""   
			        	 
		       	     }).save( function( err, VendingMachine ){
		       		       if (err) console.log("Error in getAndSaveResourceDetails "+err);
		       	     });
	       	     }); 
	            
	        }
	           else
        	   {
                  //console.log('Resource location is    '+locreg);
        	   }
	        });
	};




/*var updateVMDetails = function(message)
{
	var objectId;
    console.log(" inside update VMDetails  ");
    VendingMachine.getMachine(message.payload.Resource_ID, function(err, data) {
		if (err)
			console.log("Error to find object id from Vending Machine" + err);
	         objectid = data[0]._id
		
	         VendingMachine.update({_id : objectid}, {$set : {swarmid : message.payload.Swarm_ID,
	        	 latitude : message.payload.Latitude,longitude : message.payload.Longitude,longitude : message.payload.Longitude,
	        	 region : message.payload.Region,name : message.payload.VendingMachineName,location : message.payload.Location}
	
	}, function(err, numberAffected) {
		if (err)
			console.log("Error in update updateVMDetails" + err);
		    console.log("numberAffected in updateVMDetails:::" + numberAffected);
	 });
	});
	};*/

/**
 * Transaction details persited
 */
var saveVMDespensingDetails  =function(message)
{
	console.log("inside saveVMDespensingDetails()" );
	var machine
  if(message != null){
		 VendingMachine.getMachine(message.payload.Resource_ID, function(err, machine) {
			 Vmachine = machine
			 Item.getItemID(message.payload.Product_Name, function(err, itemDtls) {
				  
				if (err)
					console.error("Error to find object id from Vending Machine In saveVMDespensingDetails" + err);
						TxnId.increment("TxnId",function(err, TxnID) {
							if (err)  console.error("error in persistVMDespensingDetails "+err);
							//console.log("machine   "+machine+ "=====" + TxnID +"#####"+message.payload.Resource_ID+"&&&&&&&&&"+itemDtls );
	    	                   if(machine.length > 0 && TxnID.next > 0 && itemDtls.length > 0){
	    	                   
	    	                  		 var query = Inventory.find({
										'itemid' : itemDtls[0]._id,
										'resource_id' : machine[0]._id
											});
												query.exec(function(err, inventoryData) {
												if (err) console.error("Error in Inventory find" + err);
											
										if(inventoryData.length > 0){
												var TotalUnit = inventoryData[0].units, 
												updateValue = TotalUnit - 1, 
												objectid = inventoryData[0]._id
											
										if(updateValue >= 0){
	    	                   
						    	      		  new Transaction({
										 			 txnid            :TxnID.next,    
										  			 resource_id      : message.payload.Resource_ID,   
										  			 item             : message.payload.Product_Name, 
										  			 time             : message.payload.Time,
													 unitprice        : message.payload.Sale_Amount			    
									   			  })
										     		.save( function( err, VMDespensingDetails ){
										     		
										     		  if (err) {console.log("error in persistVMDespensingDetails "+err)};
										        
										            console.log("Data has been persisted For VMDispensing");
										        
										       	    updateUnitsOfItem(message);
										        
										        	if('Coupon_Code'in message.payload)
										        	{
										        		updateCouponTxnDetails(TxnID.next,Vmachine,message);
										        	}
										        	
									});
									
									}else{console.info("There is no item for Dispense")}
									
									}else{console.info("There is no item Details for Dispense")}
									
									
									});
									
	    	                   }else{console.log("machine or TxnID is not available");}     
		    	        
						});//TxnID
		 	});//VM
		 });//item
  }else{console.log("Message is not available");}
};

/**
 * 
 */

var updateCouponTxnDetails = function(txnid,machine,message)
{
	console.log("Inside updateCouponTxnDetails")
	   Coupon.getIdByCouponCode(message.payload.Coupon_Code, function(err, couponDtls) {
			if (err) console.log("Error to find object id from getIdByCouponCode" + err);
					Transaction.getIdByTxnId(txnid, function(err, txnDtls) {
						if (err)console.log("Error to find txnDtls in getIdByTxnId" + err);
						 
							if(couponDtls.length > 0 && txnDtls.length > 0){
								
									Coupon.update({ _id : couponDtls[0]._id}, {$set : {consumedon : message.payload.Time, 
															transaction_id : txnDtls[0]._id, 
															resource_id : machine[0]._id,
															resource_name :machine[0].name,
															resource_region :machine[0].region
															}},
															function(err, numberAffected) {
									if (err)
										console.log("Error in update updateCouponTxnDetails" + err);
									    console.log("numberAffected in updateCouponTxnDetails:::" + numberAffected);
									});
									
							}else{console.log("couponDtls or txnDtls is NULL ")}		
					});
	 	});
};

 

/**
 * This method is used for update unit of items inventory.
 */
var updateUnitsOfItem = function(message) {
	console.log("inside updateUnitOfItem()");
	var updateValue;
	var objectid;
	var itemStatus;
	
	VendingMachine.getMachine(message.payload.Resource_ID, function(err, machine) {
		 Item.getItemID(message.payload.Product_Name, function(err, itemDtls) {
			  if(machine.length > 0 && itemDtls.length > 0){
	
						var query = Inventory.find({
							'itemid' : itemDtls[0]._id,
							'resource_id' : machine[0]._id
						});
						query.exec(function(err, inventoryData) {
									if (err) console.error("Error in Inventory find" + err);
									if(inventoryData.length > 0){
											var TotalUnit = inventoryData[0].units, 
											updateValue = TotalUnit - 1, 
											objectid = inventoryData[0]._id
											//console.log(objectid+ " ======  "+inventoryData[0].units +"====== "+ inventoryData[0].reorderlevel)
											if(updateValue >= 0){
												
												if (updateValue <= inventoryData[0].reorderlevel || updateValue == 0) 
												{
													saveStockOutHistory(inventoryData,updateValue,message);
													
												 }
												
												if(updateValue == 0)
												{
													console.log("1")
										          	itemStatus = config.itemstatusout;
													privateForupdateUnitsOfItem (itemStatus, objectid, updateValue, machine[0]._id);
													
													
												} else if(updateValue < inventoryData[0].reorderlevel ){
												     console.log("2")
													 itemStatus = config.itemstatusbelowreorder;
												     privateForupdateUnitsOfItem (itemStatus, objectid, updateValue, machine[0]._id);
												     
												}else if(updateValue == inventoryData[0].reorderlevel ){
														console.log("3")
														itemStatus = config.itemstatusreorder;
														privateForupdateUnitsOfItem (itemStatus, objectid,updateValue, machine[0]._id);
														//saveStockOutHistory(inventoryData,updateValue,message);
												}else if(updateValue > inventoryData[0].reorderlevel ){
													console.log("4")
													itemStatus = config.itemstatusok ;
													privateForupdateUnitsOfItem (itemStatus, objectid, updateValue, machine[0]._id);
												}
											
													console.log("status     "+itemStatus)
										}else{console.info("No items for dispense" )}
									}else{console.log("Inventory data found NULL for resourceId "+message.payload.Resource_ID +" and product name "+ message.payload.Product_Name + "in updateUnitsOfItem() " )}
						});
			  }else{console.log('Machine or Item details length is zero updateUnitsOfItem()')}
		 });
	 });

};

/**
 * 
 */

var privateForupdateUnitsOfItem = function(itemStatus, objectid, updateValue, resource_id)
{
	//console.log("888888888888888888888888888888888888888888 "+objectid+"==================="+resource_id + "================"+itemStatus );
	console.log("Inside privateForupdateUnitsOfItem()");
	//InventoryStatus.getStatusIdByName(itemStatus, function(err, inventoryStatusDtls) {
			//if (err) console.log("Error to find object id from getStatusIdByName" + err);
			
			
					Inventory.update({_id : objectid}, {$set : {
										     units : updateValue,
											 status :itemStatus //inventoryStatusDtls[0].status
											}
											}, function(err, numberAffected) {
												if (err)
													console.log("Error in privateForupdateUnitsOfItem() units" + err);
												    console.log("numberAffected:::" + numberAffected);
												    getStatusPriorityAndUpadteVM(objectid, itemStatus, resource_id);
											});
									//});	
	};

/**
 * This method is used for keep track out of stock history for each item.
 */
var saveStockOutHistory = function(inventoryData,updateValue,message) {
	console.log("Enter into Stock Out of History" );
	
	if(message != null){
		var itemStatus;
		if(updateValue == 0)
			{
			 console.log("11")
	          		itemStatus = config.itemstatusout;
			 		privateForsaveStockOutHistory(inventoryData,updateValue,message,itemStatus);
	          		swarmservice.saveAlert(message,itemStatus);
	          		
			}
		else if(updateValue < inventoryData[0].reorderlevel ){
			console.log("22")
			itemStatus = config.itemstatusbelowreorder;
			console.log("22   "+itemStatus)
			privateForsaveStockOutHistory(inventoryData,updateValue,message,itemStatus);
			swarmservice.saveAlert(message,itemStatus);
			
		}
		else if(updateValue == inventoryData[0].reorderlevel ){
			console.log("33")
			itemStatus = config.itemstatusreorder;
			privateForsaveStockOutHistory(inventoryData,updateValue,message,itemStatus);
			swarmservice.saveAlert(message,itemStatus);
			
			
			
		}
	}else{console.log('Message is NULL for saveStockOutHistory()');}
};


/**
 * 
 */

var privateForsaveStockOutHistory = function(inventoryData,updateValue,message,itemStatus)
{
 console.log("inside privateForsaveStockOutHistory ")
	 VendingMachine.getMachine(message.payload.Resource_ID, function(err, machine) {
		 Item.getItemID(message.payload.Product_Name, function(err, itemDtls) {
			 //InventoryStatus.getStatusIdByName(itemStatus, function(err, inventoryStatusDtls) {
				 // if (err) console.log("Error to find object id from getStatusIdByName" + err);
			 // if(machine.length > 0 && itemDtls.length > 0){
			 if(machine.length > 0 ){
			
					    new StockOutHistory({
						time : Date.now(),
						units : updateValue,
						reorderlevel : inventoryData[0].reorderlevel,
						status :itemStatus,
						resource_id : machine[0]._id,
						itemid : message.payload.Product_Name
					})
							.save(function(err, StockOutHistory) {
								if (err)
											console
													.log(" Error in saveStockOutHistory   "
															+ err),

											console
													.log("Data has been persisted For saveStockOutHistory");
											
							});
			  }else{console.log('Machine or Item details length is zero saveStockOutHistory()')}
		//    });//Inventory
		 });//Item
	 });//VM

	
	};



		
/**
* This method is used to save Alert details
*  
*  
*/	   
module.exports.saveAlert = function(data,configName)
{
	console.log("Inside save Alert  "+configName);
	
	if(data != null && configName.length > 0 )
	{
	
		var resourceId
	    if(configName == config.vmstatusavailable)
  		{
	    	console.log("-1");
  			resourceId = data.from.resource;
  			alertHandler(data,resourceId,configName);
  			ticketserviceMgmt.removeTicketDetails(resourceId,configName);//TicketMgmt
  		}
		else if(configName == config.vmstatusunavailable)
  		{
			console.log("-2");
  			resourceId = data.from.resource;
  			alertHandler(data,resourceId,configName);
  			ticketserviceMgmt.addTicketDetails(resourceId,configName);//TicketMgmt
  		}else if('Error_Type' in data.payload)
	  		{
  			 
  				console.log("-3");
  				
  				if(data.payload.Status == config.vmstatusavailable)
  				{
  					console.log("-4");
  					 resourceId = data.payload.Resource_ID;
  					 ticketserviceMgmt.removeTicketDetails(resourceId,configName);//TicketMgmt
  				     alertHandler(data,resourceId,data.payload.Status);
  				}
  				else{
  					 console.log("-5");
  					 resourceId = data.payload.Resource_ID;
  				     ticketserviceMgmt.addTicketDetails(resourceId,data.payload.Error_Type);//TicketMgmt
  				     alertHandler(data,resourceId,data.payload.Status);
  				}
	  		}else{
	  			console.log("-6");
	  			resourceId = data.payload.Resource_ID;
	  			alertHandler(data,resourceId,configName);
	  		}
	        
	}else{console.log("Data or configName is not available ")}
	
	};
	
	
	var alertHandler = function(data,resourceId,statusName)
	{
		console.log("Inside Alert Handler " +statusName)
		if(statusName == config.vmstatusavailable || statusName == config.vmstatusunavailable )
		 {
			 updateVendingMachine(data,resourceId,statusName);
		 	 saveStatusHistory(data,statusName);
		 	 privateForSaveAlert(data,resourceId,statusName)
		 }else if(statusName == config.vmstatuserror)
		 {  
			  updateVendingMachine(data,resourceId,data.payload.Error_Type);
	 	      saveStatusHistory(data,data.payload.Error_Type);
	 	      privateForSaveAlert (data,resourceId,data.payload.Error_Type);
		}else{//--Which is use for inventory status
				 // updateVendingMachine(data,statusName);
	 	      	//saveStatusHistory(data,statusName);
	 	      privateForSaveAlert(data,resourceId,statusName);
		}
	};
	
/**
 * 
 */	
	
var privateForSaveAlert = function(data,resourceId,statusName)
{
	 
  console.log("inside privateForSaveAlert" +statusName );
  console.log("----privateForSaveAlert--------"+resourceId +"============  "+statusName )
  VendingMachine.getMachine(resourceId, function(err, machine) {
	  if(machine.length > 0){
	     InventoryStatus.getStatusIdByName1(statusName, function(err, InventoryStatus) {
		  if(InventoryStatus.length > 0){
		      console.log("GEt Status Id By NAme     "+InventoryStatus)
		       AlertConfig.getAlertConfigNameById(InventoryStatus[0]._id, function(err, alertConfig) {
	             if(alertConfig.length > 0){
			         //console.log("Alert config data   "+alertConfig);
				 new Alert({
					
					name :  statusName,
					time :  Date.now(),
					description:'Alert send',
					resource_id : machine[0]._id
					
				}).save(function(err, saveAlert) {
					if (err)
						console.log(" Error in saveAlert   " + err);

					 console.log("Data has been persisted For saveAlert");
					
					   alert.sendAlert(data,statusName);
				});
		  }else{console.log("There is no config data")}
	  		});//Config
		}else {console.log("There is no status")}
  		});//InventoryStatus
	  }else{console.log("There is no machine for resourceid "+resourceId);}
	});//VM
};
	

/**
 * 
 */
	
var saveAndUpdateInventory = function(message){
	console.log(" Inside saveAndUpdateInventory() "+ message.payload.Product_Name);
	
	var now = new Date(); 
		//console.log(now);
		
		
		var WhichQuarter = Math.floor((now.getMonth() / 3));	 
		var Whichyear = now.getFullYear();
		
	if(message != null){
		
		 VendingMachine.getMachine(message.payload.Resource_ID, function(err, machine) {
			 Item.getItemID(message.payload.Product_Name, function(err, itemDtls) {
				 //console.log("ItemDetails    "+itemDtls);
				 try{
			  if(itemDtls.length > 0){	 
			        // console.log("Item and resource   "+itemDtls[0]._id+ "      " +machine[0]._id);
				     Inventory.getInventoryDtlByItemAndResorce(itemDtls[0]._id,machine[0]._id, function(err, inventoryDtls) {
				  
					  //console.log("inventoryDtls        "+inventoryDtls)
					  InventoryStatus.getStatusIdByName(config.itemstatusok, function(err, inventoryStatusDtls) {
						 
				  if(machine.length > 0 && itemDtls.length > 0){
					  
					     saveReplenshimentHistory(message);
					  
					   if(inventoryDtls.length > 0)
						   {
						      
						      updateInventory(inventoryDtls,message.payload.Units_Replenished,machine[0]._id);
						   }
						   else{
									 new Inventory({
										itemid : itemDtls[0]._id,
										resource_id : machine[0]._id,
										units : message.payload.Units_Replenished,
										status :config.itemstatusok
									}).save(function(err, updateInventory) {
										if (err)
											console.log(" Error in saveAndUpdateInventory()   " + err);
										    
										    console.log("Data has been persisted For saveAndUpdateInventory()");
										    
										    
										new Goal({
													resource_id : machine[0].name,
													itemid : itemDtls[0].item,
													quater :WhichQuarter,
													goal:40,
													year :Whichyear
											}).save(function(err, saveGoal) {
												if (err)
													console.log(" Error in saveAndUpdateInventory() for Goal   " + err);
												    
												    console.log("Data has been persisted For saveAndUpdateInventory() for Goal");
								
									});//Goal
								});
						   }//else 
				  }else{console.log('Machine or Item details length is zero saveAndUpdateInventory()')}
				}); 
				
			 });
				  
			  }else{console.log('There is no items which kept into VM');}
			  }catch(e)
				  {
				    console.error("There is problem in saveAndUpdateInventory()"+e);
				  } 
		 });
		 });	
		
	}else{console.log('Message is NULL for saveAnd intdateInventory()');}
};

/**
 * 
 */

var updateInventory = function(inventoryDtls,units,machineId)
{
	console.log('Inside updateInventory() '+inventoryDtls);
	var vstatus
		if(inventoryDtls[0].reorderlevel > units)
		{
				 InventoryStatus.getStatusIdByName(config.itemstatusbelowreorder, function(err, inventoryStatusDtls) {
				 vstatus=inventoryStatusDtls[0].status;
				 privateForUpdateInventory(inventoryDtls,units,vstatus);
				 getStatusPriorityAndUpadteVM(inventoryDtls[0].resource_id, vstatus, machineId );
				
			});
		}else if(inventoryDtls[0].reorderlevel == units)
			{
				 InventoryStatus.getStatusIdByName(config.itemstatusreorder, function(err, inventoryStatusDtls) {
				 vstatus=inventoryStatusDtls[0].status;
				 privateForUpdateInventory(inventoryDtls,units,vstatus);
				 getStatusPriorityAndUpadteVM(inventoryDtls[0].resource_id, vstatus, machineId );
				
				});
			}else if(inventoryDtls[0].reorderlevel == 0 )			{
				 InventoryStatus.getStatusIdByName(config.itemstatusout, function(err, inventoryStatusDtls) {
				 vstatus=inventoryStatusDtls[0].status;
				 privateForUpdateInventory(inventoryDtls,units,vstatus);
				 getStatusPriorityAndUpadteVM(inventoryDtls[0].resource_id, vstatus, machineId );
				
				});
				
			}else if(inventoryDtls[0].reorderlevel < units )
			{
				 InventoryStatus.getStatusIdByName(config.itemstatusok, function(err, inventoryStatusDtls) {	
				 vstatus=inventoryStatusDtls[0].status;
				 privateForUpdateInventory(inventoryDtls,units,vstatus);
				 getStatusPriorityAndUpadteVM(inventoryDtls[0].resource_id, vstatus, machineId );
				
				});
			}
	        
	};
	
/**
 * 
 */	
	
var getStatusPriorityAndUpadteVM = function(resource_id, vstatus, machineId)
{
	var priorityInvtStatus
	var priorityVstatus
	
	
	console.log("Inside updateVMByInventoryStatus() ");
	VendingMachine.getInventoryStatusById(machineId,function(err,VMDetails){
		console.log(vstatus+"             ========================= "+resource_id+"=================="  +VMDetails)
		
		if(VMDetails[0].inventory_status == config.itemstatusok)
		{
			console.log("1");
			priorityInvtStatus = parseInt(config.priorityok);
			
		}else if(VMDetails[0].inventory_status == config.itemstatusbelowreorder)
			
		{
			console.log("2===========");
			priorityInvtStatus = parseInt(config.prioritybelowreorder);
			
		}else if(VMDetails[0].inventory_status == config.itemstatusreorder)
		{
			console.log("3");
			priorityInvtStatus = parseInt(config.priorityreorder);
			
		}else if(VMDetails[0].inventory_status == config.itemstatusout)
			
		{
			console.log("4");
			priorityInvtStatus = parseInt(config.priorityout);
		}
		
	    
		if(vstatus == config.itemstatusok)
		{
			console.log("5");
			priorityVstatus = parseInt(config.priorityok);
			
		}else if(vstatus == config.itemstatusbelowreorder)
		{
			console.log("6");
			priorityVstatus = parseInt(config.prioritybelowreorder);
			
		}else if(vstatus == config.itemstatusreorder)
		{
			console.log("7");
			priorityVstatus = parseInt(config.priorityreorder);
			
		}else if(vstatus == config.itemstatusout)
		{
			console.log("8");
			priorityVstatus = parseInt(config.priorityout);
		}
		
		if(priorityVstatus >= priorityInvtStatus )
		{
			console.log("9");
			updateVMByInventoryStatus(VMDetails[0]._id,vstatus)
		}
	
	});
	
};

/**
 * 
 */

var updateVMByInventoryStatus = function(resourceId,vstatus)
{
	console.log("Inside updateVMByInventoryStatus() ");
	
	VendingMachine.update({_id : resourceId}, {$set : {inventory_status : vstatus , InventoryStatus_time:Date.now()}
	}, function(err, numberAffected) {
		if (err)
			console.log("Error in update updateVMByInventoryStatus" + err);
		    console.log("numberAffected in updateVMByInventoryStatus " + numberAffected);
	 });	
	}

/**
 * 
 */
var privateForUpdateInventory = function(inventoryDtls,units,vstatus)
{
	console.log("inside privateForUpdateInventory() "+inventoryDtls + units +  vstatus)
	Inventory.update({_id : inventoryDtls[0]._id}, {$set : {units : units,status : vstatus}
	}, function(err, numberAffected) {
		if (err)
			console.log("Error in update updateInventoryWithStatus" + err);
		    console.log("numberAffected in updateInventoryWithStatus " + numberAffected);
	 });
	
	};

/**
 * This method is used for keep track to replenshiment history for each
 * item.
 */
var saveReplenshimentHistory = function(message) {
	console.log(" Inside saveReplenshimentHistory() ");
		if(message != null){
		
			VendingMachine.getMachine(message.payload.Resource_ID, function(err, machine) {
				Item.getItemID(message.payload.Product_Name, function(err, itemDtls) {
					if(machine.length > 0 && itemDtls.length > 0){
								new ReplenishmentHistory({
									units :  message.payload.Units_Replenished,
									time : Date.now(),
									resource_id : machine[0]._id,
									itemid : message.payload.Product_Name
								}).save(function(err, ReplenishmentHistory) {
									if (err)
										console.log(" Error in ReplenishmentHistory   " + err);
						
							console.log("Data has been persisted For ReplenishmentHistory");
							updateVMByInventoryStatus(machine[0]._id,config.itemstatusok);
						
						});
				  }else{console.log('Machine or Item details length is zero for ReplenishmentHistory()')}
			 });
		 });
	}else{console.log('Message is NULL for ReplenishmentHistory()');}
};

/**
 * This method is used for u for update vending machine with items
 * 
 */
/*var updateVendingMachineDetails = function(resourecId,items) {
	var objectId;
    console.log(" inside update VMDetails  ");
    	VendingMachineDetail.getMachine(resourecId, function(err, data) {
		if (err)
			console.log("Error to find object id from Vending Machine" + err);
	         objectid = data[0]._id
		
	         VendingMachineDetail.update({_id : objectid}, {$set : {items : items}
	}, function(err, numberAffected) {
		if (err)
			console.log("Error in update updateVMDetails" + err);
		    console.log("numberAffected in updateVMDetails " + numberAffected);
	 });
	});
};*/


/**
 * 
 */

var updateVendingMachine =  function(data,resourceId,statusName)
{
	console.log(" inside update Vending Machine   "+statusName );
	var resourceId
	if(statusName == config.vmstatusavailable)
	{
		//resourceId = data.from.resource;
		privateForupdateVendingMachine(resourceId, statusName);
	}
	else if(statusName == config.vmstatusunavailable)
	  {
		//resourceId = data.from.resource;
		privateForupdateVendingMachine(resourceId, statusName);
		
	  }else if(statusName == config.itemstatusout || statusName == config.itemstatusreorder || statusName == config.itemstatusbelowreorder)
		  {
		   // resourceId = data.from.resource;
			privateForupdateVendingMachine(resourceId, statusName);
		  }
	  else{
		 // resourceId = data.payload.Resource_ID;
		  privateForupdateVendingMachine(resourceId, data.payload.Error_Type);
		  }
	    
	};

/**
 * 
 */
var privateForupdateVendingMachine = function(resourceId, statusName)
{
  console.log("Inside privateForupadteVendingMachine "+resourceId+ "================="+ statusName)
	 VendingMachine.getMachine(resourceId, function(err, machine) {
	    	if (err)
				console.log("Error to find object id from Vending Machine" + err);
		       	if(machine.length > 0){
					VendingMachine.update({_id : machine[0]._id}, {$set : {status : statusName,VMStatus_time:Date.now()}
						}, function(err, numberAffected) {
							if (err)
								console.log("Error in update upadteVendingMachine()" + err);
							    console.log("number Affected in upadteVendingMachine() " + numberAffected);
						 });
		       	}else{ console.log("There is no data for resource: " + resourceId);}
	    });
 };
	
	
/**
 * 
 */
	
var saveStatusHistory =  function(data,statusName)
{
	console.log(" inside SaveStatusHistory()"   );
	var resourceId
	var errorCode
	if(data != null && statusName.length > 0 )
	{
	
		var resourceId
		if(statusName == config.vmstatusavailable)
  		{
  			resourceId = data.from.resource;
  			privateForSaveStatusHistory(resourceId,statusName);
  		}
		else if(statusName == config.vmstatusunavailable)
  		{
  			resourceId = data.from.resource;
  			privateForSaveStatusHistory(resourceId,statusName);
  		}else if('Error_Type' in data.payload)
	  		{
  				resourceId = data.payload.Resource_ID;
  				privateForSaveStatusHistory(resourceId,data.payload.Error_Type);
	  		}else{
	  			resourceId = data.payload.Resource_ID;
	  			privateForSaveStatusHistory(resourceId,statusName);
	  		}
	        
	}else{console.log("Data or configName is not available ")}
	
			

	};
	
/** 
 * 
 */
	
var privateForSaveStatusHistory = function(resourceId, statusName)
{
	console.log("Inside privateForSaveStatusHistory");
	VendingMachine.getMachine(resourceId, function(err, machine) {
		if (err)
			console.log("Error to find object id from Vending Machine" + err);
				VMStatus.getStatusIdByName(statusName, function(err, statusDtls) {
				  if (err)
					console.log("Error to find object id from status" + err);
				       if(machine.length > 0 && statusDtls.length > 0){
							new StatusHistory({
								errorcode       :statusName,
								time		    :Date.now(),
								resource_id     :machine[0]._id,
								status_id		:statusDtls[0]._id
								
								}).save(function(err, updateInventory) {
								if (err)
									console(" Error in newCouponEntery   " + err);
						
									console.log("Data has been persisted For saveStatusHistory");
								});
				     }else{console.log("There is no data for resource "+resourceId)}
		});
			
	});
	
	};
