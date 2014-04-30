var mongoose = require('mongoose'),
   VendingMachine = mongoose.model('VendingMachine'),
   MockServiceMgmt = mongoose.model('MockServiceMgmtSchema'),
   TicketId = mongoose.model('TicketId')
   
   

module.exports.addTicketDetails = function(resourceid,status)
{
	console.log("========  "+resourceid);
	 VendingMachine.getMachine(resourceid, function(err, machine) {
		
					TicketId.increment("TicketId",function(err, TicketId) {
						if (err)  console.log("error in persistVMDespensingDetails "+err);
						try{
						console.log("machine   "+machine+ "=====" + TicketId +"-------- "+resourceid+"-------- "+status+"--------- "+machine[0].name );
    	                   if(machine.length > 0 && TicketId.next > 0 ){
					    	        new MockServiceMgmt({
					    	        	 ticketid: 	        TicketId.next,
					    	             resource_id: 	    resourceid,
					    	             machinestatus:		status,
					    	             machinename:		machine[0].name,
					    	             machineaddress:	machine[0].address,
					    	             machineregion:	    machine[0].region,
					    	             
								     })
									     .save( function( err, TicketDetails ){
									       if (err) console.log("error in persistVMDespensingDetails "+err);
									        
									       console.log("Data has been persisted For addTicketDetails");
									        
									       	  
								});
    	                   
    	                   }else{console.log("machine or TicketID is not available");}   
					}catch(e)
	                   {
	                	   console.error("There is some problem in "+e)
	                   }
					});//TicketId
	 });//VMDeatils
	
};



/**
*
*/


module.exports.removeTicketDetails = function(resourceid)
{
	MockServiceMgmt.remove({'resource_id' :resourceid}).
				       exec(function(err, numberAffected) {
					if (err)
					  console.log("Error in update removeTicketDetails" + err);
					  console.log("numberAffected in removeTicketDetails:::" + numberAffected);
					    
					});
};