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
     
var logger= require('./../resource/logger.js');
var log=logger.LOG;

module.exports.swarmMessageControler = function(message)
{
 	 if(message != null){
		 log.info("######### swarmMessageControler call ###########");
		 log.info("Message:::   "+JSON.stringify(message.payload));
		 if('Units_Replenished' in message.payload && message !=null  )
			 {
				 log.info("Products Got");
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
					 try{
					 if(err) {
						 log.info("Error in isResourceNew "+err);
						 };
				
					 if(VMDetails.length == 0)
					  {  
						 log.info("New Vending Machine Got  "+resourceId );
						 getAndSaveResourceDetails(resourceId,statusType);
					  }	
					 }catch(Exception){
						 log.error("There is problem in Method: isResourceNew() "+Exception);
					 }
				 
		 });
	 }else{
		 log.info("resourceId or statusType is not available ");
		 }
		 
 };
 
 
 
var getAndSaveResourceDetails = function(resourceId,statusType)
{
	var vmDetails;
	var location;
	var region;
	var vlatitude;
	var vlongitude;
	
	    request
	        .get(config.resourceinfourl+resourceId)
	        .set(config.header)
	        .end(function(res) {
	        try{
	        	var vmDetails = JSON.parse(res.text);
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
	       		     .save( function( err, VendingMachine){
	       		    	 try{
	       		     if(err){
	       		    	   log.info("Error in getAndSaveResourceDetails "+err);
	       		    	   }
	       		     
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
		       	    	 try{
		       		       if (err){
		       		    	   log.info("Error in getAndSaveResourceDetails "+err);
		       		       }
		       		    	   
		       	    	 }catch(Exception){
	       		    		 log.error("There is problem in Method: getAndSaveResourceDetails() new VendingMachineDetail "+Exception);
	       		    	 }
		       	     });
	       		    	 }catch(Exception){
	       		    		 log.error("There is problem in Method: getAndSaveResourceDetails() new VendingMachine "+Exception);
	       		    	 }
	       	     }); 
	            
	        }
	           else
        	   {
                  //log.info('Resource location is    '+locreg);
        	   }
	        }catch(Exception){
	        	 log.error("There is problem in Method: getAndSaveResourceDetails() "+Exception);
	        }
	        });
	        
	};




/**
 * Transaction details persited
 */
var saveVMDespensingDetails  =function(message)
{
	log.info("inside saveVMDespensingDetails()" );
	var machine;
  if(message != null){
		 VendingMachine.getMachine(message.payload.Resource_ID, function(err, machine) {
			 try{
			 Vmachine = machine;
			 Item.getItemID(message.payload.Product_Name, function(err, itemDtls) {
				try{
				if (err)
					log.error.error("Error to find object id from Vending Machine In saveVMDespensingDetails" + err);
						TxnId.increment("TxnId",function(err, TxnID) {
							try{
							if (err) {
								log.error("error in persistVMDespensingDetails "+err);
							}
							//log.info("machine   "+machine+ "=====" + TxnID +"#####"+message.payload.Resource_ID+"&&&&&&&&&"+itemDtls );
	    	                   if(machine.length > 0 && TxnID.next > 0 && itemDtls.length > 0){
	    	                   
	    	                  		 var query = Inventory.find({
										'itemid' : itemDtls[0]._id,
										'resource_id' : machine[0]._id
											});
												query.exec(function(err, inventoryData) {
													try{
												if (err){
													log.error("Error in Inventory find" + err);
												}
											
										if(inventoryData.length > 0){
												var TotalUnit = inventoryData[0].units, 
												updateValue = TotalUnit - 1, 
												objectid = inventoryData[0]._id;
											
										if(updateValue >= 0){
	    	                   
						    	      		  new Transaction({
										 			 txnid            :TxnID.next,    
										  			 resource_id      : message.payload.Resource_ID,   
										  			 item             : message.payload.Product_Name, 
										  			 time             : message.payload.Time,
													 unitprice        : message.payload.Sale_Amount			    
									   			  })
										     		.save( function( err, VMDespensingDetails ){
										     			try{
										     		if (err) {
										     			log.info("error in persistVMDespensingDetails "+err);
										     		}
										            log.info("Data has been persisted For VMDispensing");
										            updateUnitsOfItem(message);
										        	if('Coupon_Code'in message.payload)
										        	{
										        		updateCouponTxnDetails(TxnID.next,Vmachine,message);
										        	}
										    }catch(Exception){
												 log.error("There is problem in Method: saveVMDespensingDetails() Inventory.find "+Exception);
											}	    	
									});
									
									}else{
										console.info("There is no item for Dispense");
									}
									
									}else{
										console.info("There is no item Details for Dispense");
									}
									
										}catch(Exception){
										 log.error("There is problem in Method: saveVMDespensingDetails() Inventory.find "+Exception);
									    }	
									});
									
	    	                   }else{
	    	                	   log.info("machine or TxnID is not available");
	    	                	   }     
							}catch(Exception){
								 log.error("There is problem in Method: saveVMDespensingDetails() TxnId.increment "+Exception);
							 }      
						});//TxnID
				}catch(Exception){
					 log.error("There is problem in Method: saveVMDespensingDetails() Item.getItemID "+Exception);
				 }
		 	});//VM
			 }catch(Exception){
				 log.error("There is problem in Method: saveVMDespensingDetails() VendingMachine.getMachine "+Exception);
			 }
		 });//item
  }else{
	  log.info("Message is not available");
	  }
};

/**
 * 
 */

var updateCouponTxnDetails = function(txnid,machine,message)
{
	log.info("Inside updateCouponTxnDetails");
	   Coupon.getIdByCouponCode(message.payload.Coupon_Code, function(err, couponDtls) {
		   try{
			if (err){
				log.info("Error to find object id from getIdByCouponCode" + err);
			}
					Transaction.getIdByTxnId(txnid, function(err, txnDtls) {
						try{
						if (err){
							log.info("Error to find txnDtls in getIdByTxnId" + err);
						}
						 
							if(couponDtls.length > 0 && txnDtls.length > 0){
								
									Coupon.update({ _id : couponDtls[0]._id}, {$set : {consumedon : message.payload.Time, 
															transaction_id : txnDtls[0]._id, 
															resource_id : machine[0]._id,
															resource_name :machine[0].name,
															resource_region :machine[0].region
															}},
															function(err, numberAffected) {
									try{
									if (err){
										log.info("Error in update updateCouponTxnDetails" + err);
									}
									    log.info("numberAffected in updateCouponTxnDetails:::" + numberAffected);
									}catch(Exception){
										 log.error("There is problem in Method: updateCouponTxnDetails() Coupon.update"+Exception);
									 }
									});
									
							}else{
								log.info("couponDtls or txnDtls is NULL ");
							}		
						}catch(Exception){
							 log.error("There is problem in Method: updateCouponTxnDetails() Transaction.getIdByTxnId"+Exception);
						 }
						});
					
		   }catch(Exception){
				 log.error("There is problem in Method: updateCouponTxnDetails() Coupon.getIdByCouponCode"+Exception);
			 }
	 	});
};

 

/**
 * This method is used for update unit of items inventory.
 */
var updateUnitsOfItem = function(message) {
	log.info("inside updateUnitOfItem()");
	var updateValue;
	var objectid;
	var itemStatus;
	
	VendingMachine.getMachine(message.payload.Resource_ID, function(err, machine) {
		try{
		 Item.getItemID(message.payload.Product_Name, function(err, itemDtls) {
			 try{
			  if(machine.length > 0 && itemDtls.length > 0){
	
						var query = Inventory.find({
							'itemid' : itemDtls[0]._id,
							'resource_id' : machine[0]._id
						});
						query.exec(function(err, inventoryData) {
							try{
									if (err) {
										log.error("Error in Inventory find" + err);
									}
									if(inventoryData.length > 0){
											var TotalUnit = inventoryData[0].units, 
											updateValue = TotalUnit - 1, 
											objectid = inventoryData[0]._id;
											//log.info(objectid+ " ======  "+inventoryData[0].units +"====== "+ inventoryData[0].reorderlevel)
											if(updateValue >= 0){
												
												if (updateValue <= inventoryData[0].reorderlevel || updateValue == 0) 
												{
													saveStockOutHistory(inventoryData,updateValue,message);
													
												 }
												
												if(updateValue == 0)
												{
													log.info("1");
										          	itemStatus = config.itemstatusout;
													privateForupdateUnitsOfItem (itemStatus, objectid, updateValue, machine[0]._id);
													
													
												} else if(updateValue < inventoryData[0].reorderlevel ){
												     log.info("2");
													 itemStatus = config.itemstatusbelowreorder;
												     privateForupdateUnitsOfItem (itemStatus, objectid, updateValue, machine[0]._id);
												     
												}else if(updateValue == inventoryData[0].reorderlevel ){
														log.info("3");
														itemStatus = config.itemstatusreorder;
														privateForupdateUnitsOfItem (itemStatus, objectid,updateValue, machine[0]._id);
														//saveStockOutHistory(inventoryData,updateValue,message);
												}else if(updateValue > inventoryData[0].reorderlevel ){
													log.info("4");
													itemStatus = config.itemstatusok ;
													privateForupdateUnitsOfItem (itemStatus, objectid, updateValue, machine[0]._id);
												}
											
													log.info("status     "+itemStatus);
										}else{
											console.info("No items for dispense" );
											}
									}else{
										log.info("Inventory data found NULL for resourceId "+message.payload.Resource_ID +" and product name "+ message.payload.Product_Name + "in updateUnitsOfItem() " );
										}
							}catch(Exception){
								 log.error("There is problem in Method: updateUnitsOfItem() Inventory.find Query "+Exception);
							 }
							});
			  }else{
				  log.info('Machine or Item details length is zero updateUnitsOfItem()');
				  }
			 }catch(Exception){
				 log.error("There is problem in Method: updateUnitsOfItem() Item.getItemID "+Exception);
			 }	  
		 });
		}catch(Exception){
			 log.error("There is problem in Method: updateUnitsOfItem() VendingMachine.getMachine "+Exception);
		 }
	 });

};

/**
 * 
 */

var privateForupdateUnitsOfItem = function(itemStatus, objectid, updateValue, resource_id)
{
	//log.info(" "+objectid+"=="+resource_id + "=="+itemStatus );
	log.info("Inside privateForupdateUnitsOfItem()");
	//InventoryStatus.getStatusIdByName(itemStatus, function(err, inventoryStatusDtls) {
			//if (err) log.info("Error to find object id from getStatusIdByName" + err);
			
			
					Inventory.update({_id : objectid}, {$set : {
										     units : updateValue,
											 status :itemStatus //inventoryStatusDtls[0].status
											}
											}, function(err, numberAffected) {
												try{
												if (err){
													log.info("Error in privateForupdateUnitsOfItem() units" + err);
												}
												    log.info("numberAffected:::" + numberAffected);
												    getStatusPriorityAndUpadteVM(objectid, itemStatus, resource_id);
												}catch(Exception){
													 log.error("There is problem in Method: privateForupdateUnitsOfItem() Inventory.update "+Exception);
												}
											});
									//});	
	};

/**
 * This method is used for keep track out of stock history for each item.
 */
var saveStockOutHistory = function(inventoryData,updateValue,message) {
	try{
	log.info("Enter into Stock Out of History" );
	
	if(message != null){
		var itemStatus;
		if(updateValue == 0)
			{
			 log.info("11");
	          		itemStatus = config.itemstatusout;
			 		privateForsaveStockOutHistory(inventoryData,updateValue,message,itemStatus);
	          		swarmservice.saveAlert(message,itemStatus);
	          		
			}
		else if(updateValue < inventoryData[0].reorderlevel ){
			log.info("22");
			itemStatus = config.itemstatusbelowreorder;
			log.info("22   "+itemStatus);
			privateForsaveStockOutHistory(inventoryData,updateValue,message,itemStatus);
			swarmservice.saveAlert(message,itemStatus);
			
		}
		else if(updateValue == inventoryData[0].reorderlevel ){
			log.info("33");
			itemStatus = config.itemstatusreorder;
			privateForsaveStockOutHistory(inventoryData,updateValue,message,itemStatus);
			swarmservice.saveAlert(message,itemStatus);
			
			
			
		}
	}else{
		log.info('Message is NULL for saveStockOutHistory()');
		}
	}catch(Exception){
		 log.error("There is problem in Method: saveStockOutHistory() "+Exception);
	}
};


/**
 * 
 */

var privateForsaveStockOutHistory = function(inventoryData,updateValue,message,itemStatus)
{
 log.info("inside privateForsaveStockOutHistory ");
	 VendingMachine.getMachine(message.payload.Resource_ID, function(err, machine) {
		 try{
		 Item.getItemID(message.payload.Product_Name, function(err, itemDtls) {
			 try{
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
								try{
								if (err){
									console.log(" Error in saveStockOutHistory   "+ err);
								}
								console.log("Data has been persisted For saveStockOutHistory");
								}catch(Exception){
									log.error("There is problem in Method: privateForsaveStockOutHistory() StockOutHistory.Save "+Exception);
								}
							});
			  }else{
				  log.info('Machine or Item details length is zero saveStockOutHistory()');
				  }
			 }catch(Exception){
				 log.error("There is problem in Method: privateForsaveStockOutHistory() Item.getItemID "+Exception);
			 }
		 });//Item
		 }catch(Exception){
			 log.error("There is problem in Method: privateForsaveStockOutHistory() VendingMachine.getMachine "+Exception);
		 }
	 });//VM

	
	};



		
/**
* This method is used to save Alert details
*  
*  
*/	   
module.exports.saveAlert = function(data,configName)
{
	try{
	log.info("Inside save Alert  "+configName);
	
	if(data != null && configName.length > 0 )
	{
	
		var resourceId;
	    if(configName == config.vmstatusavailable)
  		{
	    	log.info("-1");
  			resourceId = data.from.resource;
  			alertHandler(data,resourceId,configName);
  			ticketserviceMgmt.removeTicketDetails(resourceId,configName);//TicketMgmt
  		}
		else if(configName == config.vmstatusunavailable)
  		{
			log.info("-2");
  			resourceId = data.from.resource;
  			alertHandler(data,resourceId,configName);
  			ticketserviceMgmt.addTicketDetails(resourceId,configName);//TicketMgmt
  		}else if('Error_Type' in data.payload)
	  		{
  			 
  				log.info("-3");
  				
  				if(data.payload.Status == config.vmstatusavailable)
  				{
  					log.info("-4");
  					 resourceId = data.payload.Resource_ID;
  					 ticketserviceMgmt.removeTicketDetails(resourceId,configName);//TicketMgmt
  				     alertHandler(data,resourceId,data.payload.Status);
  				}
  				else{
  					 log.info("-5");
  					 resourceId = data.payload.Resource_ID;
  				     ticketserviceMgmt.addTicketDetails(resourceId,data.payload.Error_Type);//TicketMgmt
  				     alertHandler(data,resourceId,data.payload.Status);
  				}
	  		}else{
	  			log.info("-6");
	  			resourceId = data.payload.Resource_ID;
	  			alertHandler(data,resourceId,configName);
	  		}
	        
	}else{
		log.info("Data or configName is not available ");
		}
	}catch(Exception){
		log.error("There is problem in Method: saveAlert() "+Exception);
	}
	};
	
	
	var alertHandler = function(data,resourceId,statusName)
	{
		try{
		log.info("Inside Alert Handler " +statusName);
		if(statusName == config.vmstatusavailable || statusName == config.vmstatusunavailable )
		 {
			 updateVendingMachine(data,resourceId,statusName);
		 	 saveStatusHistory(data,statusName);
		 	 privateForSaveAlert(data,resourceId,statusName);
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
		}catch(Exception){
			log.error("There is problem in Method: alertHandler() "+Exception);
		}
	};
	
/**
 * 
 */	
	
var privateForSaveAlert = function(data,resourceId,statusName)
{
	 
  log.info("inside privateForSaveAlert" +statusName );
  log.info("----privateForSaveAlert--------"+resourceId +"============  "+statusName );
  VendingMachine.getMachine(resourceId, function(err, machine) {
	  try{
	  if(machine.length > 0){
	     InventoryStatus.getStatusIdByName1(statusName, function(err, InventoryStatus) {
	    	 try{
		  if(InventoryStatus.length > 0){
		      log.info("GEt Status Id By NAme     "+InventoryStatus);
		       AlertConfig.getAlertConfigNameById(InventoryStatus[0]._id, function(err, alertConfig) {
		    	   try{
	             if(alertConfig.length > 0){
			         //log.info("Alert config data   "+alertConfig);
				 new Alert({
					
					name :  statusName,
					time :  Date.now(),
					description:'Alert send',
					resource_id : machine[0]._id
					
				}).save(function(err, saveAlert) {
					try{
					if (err){
						log.info(" Error in saveAlert   " + err);
					}
						log.info("Data has been persisted For saveAlert");
					    alert.sendAlert(data,statusName);
					}catch(Exception){
						 log.error("There is problem in Method: privateForSaveAlert() Alert.Save "+Exception);
					}
				});
		  }else{
			  log.info("There is no config data");
			  }
		    	   }catch(Exception){
		    		   log.error("There is problem in Method: privateForSaveAlert() AlertConfig.getAlertConfigNameById "+Exception);
		    	   }
	  		});//Config
		}else {
			log.info("There is no status");
			}
	    	 }catch(Exception){
				 log.error("There is problem in Method: privateForSaveAlert() InventoryStatus.getStatusIdByName1 "+Exception);
			 }
  		});//InventoryStatus
	  }else{
		  log.info("There is no machine for resourceid "+resourceId);
		  }
	  }catch(Exception){
			 log.error("There is problem in Method: privateForSaveAlert() VendingMachine.getMachine "+Exception);
		 }
	});//VM
};
	

/**
 * 
 */
	
var saveAndUpdateInventory = function(message){
	log.info(" Inside saveAndUpdateInventory() "+ message.payload.Product_Name);
	
	var now = new Date(); 
		//log.info(now);
		
		
		var WhichQuarter = Math.floor((now.getMonth() / 3));	 
		var Whichyear = now.getFullYear();
		
	if(message != null){
		
		 VendingMachine.getMachine(message.payload.Resource_ID, function(err, machine) {
			 try{
			 Item.getItemID(message.payload.Product_Name, function(err, itemDtls) {
				 try{
			  if(itemDtls.length > 0){	 
			        // log.info("Item and resource   "+itemDtls[0]._id+ "      " +machine[0]._id);
				     Inventory.getInventoryDtlByItemAndResorce(itemDtls[0]._id,machine[0]._id, function(err, inventoryDtls) {
				  
					  //log.info("inventoryDtls        "+inventoryDtls)
					  InventoryStatus.getStatusIdByName(config.itemstatusok, function(err, inventoryStatusDtls) {
						  try{
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
										try{
										if (err){
											log.info(" Error in saveAndUpdateInventory()   " + err);
										}
										    log.info("Data has been persisted For saveAndUpdateInventory()");
										
										    new Goal({
													resource_id : machine[0].name,
													itemid : itemDtls[0].item,
													quater :WhichQuarter,
													goal:40,
													year :Whichyear
											}).save(function(err, saveGoal) {
												try{
												if (err){
													log.info(" Error in saveAndUpdateInventory() for Goal   " + err);
												}
												    log.info("Data has been persisted For saveAndUpdateInventory() for Goal");
												}catch(Exception){
													log.error("There is problem in Method: saveAndUpdateInventory()   Goal.Save "+Exception);	
												}
									});//Goal
										}catch(Exception){
											 log.error("There is problem in Method: saveAndUpdateInventory()   Inventory.Save "+Exception);
										 }
								});
						   }//else 
				  }else{
					  log.info('Machine or Item details length is zero saveAndUpdateInventory()');
				  }
						  }catch(Exception){
								 log.error("There is problem in Method: saveAndUpdateInventory()   InventoryStatus.getStatusIdByName "+Exception);
							 }
				}); 
				
			 });
				  
			  }else{
				  log.info('There is no items which kept into VM');
				  }
			 	 }catch(Exception){
					 log.error("There is problem in Method: saveAndUpdateInventory()  Item.getItemID "+Exception);
				 }
		 });
			 }catch(Exception){
				 log.error("There is problem in Method: saveAndUpdateInventory() VendingMachine.getMachine "+Exception);
			 }
		 });	
		
	}else{
		log.info('Message is NULL for saveAnd intdateInventory()');
	}
};

/**
 * 
 */

var updateInventory = function(inventoryDtls,units,machineId)
{
	try{
	log.info('Inside updateInventory() '+inventoryDtls);
	var vstatus;
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
	}catch(Exception){
		 log.error("There is problem in Method: updateInventory() "+Exception);
	 }
	};
	
/**
 * 
 */	
	
var getStatusPriorityAndUpadteVM = function(resource_id, vstatus, machineId)
{
	var priorityInvtStatus;
	var priorityVstatus;
	log.info("Inside updateVMByInventoryStatus() ");
	VendingMachine.getInventoryStatusById(machineId,function(err,VMDetails){
		try{
		log.info(vstatus+"== "+resource_id+"=="  +VMDetails);
		
		if(VMDetails[0].inventory_status == config.itemstatusok)
		{
			log.info("1");
			priorityInvtStatus = parseInt(config.priorityok);
			
		}else if(VMDetails[0].inventory_status == config.itemstatusbelowreorder)
			
		{
			log.info("2===========");
			priorityInvtStatus = parseInt(config.prioritybelowreorder);
			
		}else if(VMDetails[0].inventory_status == config.itemstatusreorder)
		{
			log.info("3");
			priorityInvtStatus = parseInt(config.priorityreorder);
			
		}else if(VMDetails[0].inventory_status == config.itemstatusout)
			
		{
			log.info("4");
			priorityInvtStatus = parseInt(config.priorityout);
		}
		
	    
		if(vstatus == config.itemstatusok)
		{
			log.info("5");
			priorityVstatus = parseInt(config.priorityok);
			
		}else if(vstatus == config.itemstatusbelowreorder)
		{
			log.info("6");
			priorityVstatus = parseInt(config.prioritybelowreorder);
			
		}else if(vstatus == config.itemstatusreorder)
		{
			log.info("7");
			priorityVstatus = parseInt(config.priorityreorder);
			
		}else if(vstatus == config.itemstatusout)
		{
			log.info("8");
			priorityVstatus = parseInt(config.priorityout);
		}
		
		if(priorityVstatus >= priorityInvtStatus )
		{
			log.info("9");
			updateVMByInventoryStatus(VMDetails[0]._id,vstatus);
		}
		}catch(Exception){
			 log.error("There is problem in Method: getStatusPriorityAndUpadteVM() "+Exception);
		 }
	});
	
};

/**
 * 
 */

var updateVMByInventoryStatus = function(resourceId,vstatus)
{
	log.info("Inside updateVMByInventoryStatus() ");
	
	VendingMachine.update({_id : resourceId}, {$set : {inventory_status : vstatus , InventoryStatus_time:Date.now()}
	}, function(err, numberAffected) {
		try{
		if (err){
			log.info("Error in update updateVMByInventoryStatus" + err);
		}
		    log.info("numberAffected in updateVMByInventoryStatus " + numberAffected);
		}catch(Exception){
			 log.error("There is problem in Method: updateVMByInventoryStatus() "+Exception);
		}
	 });	
	};

/**
 * 
 */
var privateForUpdateInventory = function(inventoryDtls,units,vstatus)
{
	log.info("inside privateForUpdateInventory() "+inventoryDtls + units +  vstatus);
	Inventory.update({_id : inventoryDtls[0]._id}, {$set : {units : units,status : vstatus}
	}, function(err, numberAffected) {
		try{
		if (err){
			log.info("Error in update updateInventoryWithStatus" + err);
		}
		    log.info("numberAffected in updateInventoryWithStatus " + numberAffected);
		}catch(Exception){
			 log.error("There is problem in Method: privateForUpdateInventory() "+Exception);
		 }
	 });
	
	};

/**
 * This method is used for keep track to replenshiment history for each
 * item.
 */
var saveReplenshimentHistory = function(message) {
	log.info(" Inside saveReplenshimentHistory() ");
		if(message != null){
		
			VendingMachine.getMachine(message.payload.Resource_ID, function(err, machine) {
				try{
				Item.getItemID(message.payload.Product_Name, function(err, itemDtls) {
					try{
					if(machine.length > 0 && itemDtls.length > 0){
								new ReplenishmentHistory({
									units :  message.payload.Units_Replenished,
									time : Date.now(),
									resource_id : machine[0]._id,
									itemid : message.payload.Product_Name
								}).save(function(err, ReplenishmentHistory) {
									try{
									if (err){
										log.info(" Error in ReplenishmentHistory   " + err);
									}
						
							log.info("Data has been persisted For ReplenishmentHistory");
							updateVMByInventoryStatus(machine[0]._id,config.itemstatusok);
									}catch(Exception){
										 log.error("There is problem in Method: saveReplenshimentHistory() ReplenishmentHistory.Save "+Exception);
									 }
						});
				  }else{
					  log.info('Machine or Item details length is zero for ReplenishmentHistory()');
				  }
					}catch(Exception){
						 log.error("There is problem in Method: saveReplenshimentHistory() Item.getItemID "+Exception);
					 }				
			 });
				}catch(Exception){
					 log.error("There is problem in Method: saveReplenshimentHistory() VendingMachine.getMachine "+Exception);
				 }				
		 });
	}else{
		log.info('Message is NULL for ReplenishmentHistory()');
		}
};

/**
 * 
 */

var updateVendingMachine =  function(data,resourceId,statusName)
{
	try{
	log.info(" inside update Vending Machine   "+statusName );
	var resourceId;
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
	}catch(Exception){
		 log.error("There is problem in Method: updateVendingMachine() "+Exception);
	 }
	};

/**
 * 
 */
var privateForupdateVendingMachine = function(resourceId, statusName)
{
  log.info("Inside privateForupadteVendingMachine");
	 VendingMachine.getMachine(resourceId, function(err, machine) {
		 try{
	    	if (err){
	    		log.info("Error to find object id from Vending Machine" + err);
	    	}
		       	if(machine.length > 0){
					VendingMachine.update({_id : machine[0]._id}, {$set : {status : statusName,VMStatus_time:Date.now()}
						}, function(err, numberAffected) {
							try{
							if (err){
								log.info("Error in update upadteVendingMachine()" + err);
							}
							    log.info("number Affected in upadteVendingMachine() " + numberAffected);
							}catch(Exception){
								 log.error("There is problem in Method: privateForupdateVendingMachine() VendingMachine.update "+Exception);
							 }
						 });
		       	}else{ 
		       		log.info("There is no data for resource: " + resourceId);
		       		}
		 }catch(Exception){
			 log.error("There is problem in Method: privateForupdateVendingMachine() "+Exception);
		 }
	    });
 };
	
	
/**
 * 
 */
	
var saveStatusHistory =  function(data,statusName)
{
	try{
	log.info("inside SaveStatusHistory()");
	var resourceId;
	var errorCode;
	if(data != null && statusName.length > 0 )
	{
		var resourceId;
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
	        
	}else{
		log.info("Data or configName is not available ");
		}
	}catch(Exception){
		 log.error("There is problem in Method: saveStatusHistory() "+Exception);
	 }
	};
	
/** 
 * 
 */
	
var privateForSaveStatusHistory = function(resourceId, statusName)
{
	log.info("Inside privateForSaveStatusHistory");
	VendingMachine.getMachine(resourceId, function(err, machine) {
		try{
		if (err){
			log.info("Error to find object id from Vending Machine" + err);
		}
				VMStatus.getStatusIdByName(statusName, function(err, statusDtls) {
					try{
				  if (err){
					  log.info("Error to find object id from status" + err);
				  }
				       if(machine.length > 0 && statusDtls.length > 0){
							new StatusHistory({
								errorcode       :statusName,
								time		    :Date.now(),
								resource_id     :machine[0]._id,
								status_id		:statusDtls[0]._id
								
								}).save(function(err, updateInventory) {
									try{
								if (err){
									console(" Error in newCouponEntery   " + err);
								}
									log.info("Data has been persisted For saveStatusHistory");
									}catch(Exception){
										 log.error("There is problem in Method: privateForSaveStatusHistory() StatusHistory.save "+Exception);
									 }
								});
				     }else{
				    	 log.info("There is no data for resource "+resourceId);
				     }
					}catch(Exception){
						 log.error("There is problem in Method: privateForSaveStatusHistory() VMStatus.getStatusIdByName "+Exception);
					 }
		});
		}catch(Exception){
			 log.error("There is problem in Method: privateForSaveStatusHistory() VendingMachine.getMachine "+Exception);
		 }
	});
	
	};
