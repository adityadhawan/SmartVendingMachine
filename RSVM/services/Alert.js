

var  mongoose = require('mongoose'),
	VendingMachine = mongoose.model('VendingMachine'),
	Alert = mongoose.model('Alert'),
    AlertConfig = mongoose.model('AlertConfig'),
    User = mongoose.model('User'),
    VMStatus = mongoose.model('VMStatus'),
    AlarmType = mongoose.model('AlarmType'),
    InventoryStatus = mongoose.model('InventoryStatus'),
   
    config = require('../resource/config'),
    mailer = require('../util/alert/Mailer'),
    sms = require('../util/alert/SMS')
   

var isNull = function(value)
	{
		if(value.length>0) {return false;}
	return true;
	}


/**
 * 
 */

module.exports.sendAlert = function(data,StatusName)
{
 console.log("Inside Send Alert"+StatusName);

 phoneNo = []; 
 email = []; 
 userList =[];  
 InventoryStatus.getStatusIdByName1(StatusName, function(err, inventoryStatus){
	  if(err)console.log("There is some error to get inventorystatus "+err);
	 // console.log("=======================  "+inventoryStatus)
   if(inventoryStatus.length > 0){
	  AlertConfig
		 .find({ allstatus: inventoryStatus[0]._id})		
			  .populate('userlist')
		      .populate('vm_status','status')
		      .populate('alarm_type','name')
		      .exec(function (err, AlertConfig) { 
		       //console.log("AlertConfig:::::"+AlertConfig);
		
		    /*   
		       { _id: 531812db760aa1e366853b59,
		    	   name: 'Re-order',
		    	   alerttext: 'This is Test Alert for Re-order',
		    	   alertstatus: 'Active',
		    	   alarm_type: [ { _id: 53171689760ad435354cfc48, name: 'email' } ],
		    	   vm_status: [ { _id: 53171657760ad435354cfc46, status: 'available' } ],
		    	   userlist: 
		    	    [ { _id: 531716dd760ad435354cfc4b,
		    	        name: 'Ritesh',
		    	        email: 'rr00332115@techmahindra.com',
		    	        phone: 9650922966 },
		    	      { _id: 531716dd760ad435354cfc4c,
		    	        name: 'Jatin',
		    	        email: 'ja00336361@techmahindra.com',
		    	        phone: 9650922966 } ] }*/
		        if(AlertConfig.length>0){
		       
		          if(AlertConfig[0].alertstatus == config.alertstatusactive )
		        	  {
		        	  
		        	  	userList = AlertConfig[0].userlist;
		        	  	
		        	  if(userList.length > 0)
		        		 {
				        	  	for(var i=0;i<userList.length;i++)
				        	  		{
				        	  			 email[i] = userList[i].email;
				                         phoneNo[i] = "+"+userList[i].phone;
				        	  		}
				        	  				
				        	     if(AlertConfig[0].alarm_type[0].name == config.alarmtypeemail)
				        	    	 { 
				        	    	 
				        	    	    if(!isNull(email))
				        	    	    	{
				        	    	    	  
				        	    	    	  
				        	    	    	  sendEmail(data,StatusName,email,AlertConfig[0].alarm_type[0].name);
				        	    	    	  
				        	    	    	}else
				        	    	    		{
				        	    	    		  console.log("There is no data for mail");
				        	    	    		}
				        	    	    
				        	    	 }else if(AlertConfig[0].alarm_type[0].name == config.alarmtypephone)
				        	    		 {
				        	    		 if(!isNull(phoneNo))
				        	    	    	{
				        	    			 	
				        	    			 	sendSms(data,StatusName,phoneNo,AlertConfig[0].alarm_type[0].name);
				        	    	    	}else
				        	    	    		{
				        	    	    		  console.log("There is no data for SMS");
				        	    	    		}
				        	    	     
				        	    		 }else if(AlertConfig[0].alarm_type[0].name == config.alarmtypeboth)
				        	    			 {
				        	    			 if(!isNull(email) && !isNull(phoneNo) )
					        	    	    	{
				        	    				 
					        	    	    	
					        	    	    	sendAlertEmailSms(data,StatusName,email,phoneNo,AlertConfig[0].alarm_type[0].name);
					        	    	    	
					        	    	    	}else
					        	    	    		{
					        	    	    		
					        	    	    		  console.log("There is no data for both");
					        	    	    		}
					        	    	    
				        	    			 }
		        		 }else
		        			 {
		        			  console.log("There is no User List");
		        			 }
		        	  }else{
				    	  console.log("There is no active user for "+StatusName);
				      }
		      }
		      else{
		    	  console.log("There is no alarm config for "+StatusName);
		      }
		      
		});
	//});//VM Status
 }else{console.log("There is no inventory status ")}
   });//inventory Status
	};

	
	/**
	 * This method is used for send Alert through Email
	 * 
	 */

var sendEmail = function(data,StatusName,emailAddress,alarmType) {
var resourceId;
	if(StatusName == config.vmstatusavailable)
	{
		resourceId = data.from.resource;
		privateForSendMail(resourceId,data,StatusName,emailAddress,alarmType)
	}
  else if(StatusName == config.vmstatusunavailable)
	  {
	  	resourceId = data.from.resource;
	  	privateForSendMail(resourceId,data,StatusName,emailAddress,alarmType);
	  }else if(StatusName == config.itemstatusout || StatusName == config.itemstatusreorder || StatusName == config.itemstatusbelowreorder)
	  {
		    resourceId = data.from.resource;
		    privateForSendMail(resourceId,data,StatusName,emailAddress,alarmType);
		  }
	  	else
		  {
		  resourceId = data.payload.Resource_ID;
		  privateForSendMail(resourceId,data,StatusName,emailAddress,alarmType)
		  }
	  
		  
   };
   
/**
 * 
 */
 var privateForSendMail = function(resourceId,data,StatusName,emailAddress,alarmType)
 {
	 console.log("Inside privateForSendmail")
	 VendingMachine.getMachine(resourceId, function(err, machine) {
 		  if(err)console.log("The errors are to fined details machine in sendEmail()  "+err);
	  		
 		  	if(machine.length > 0){  
				   mailer.send(emailAddress,{
					machine: machine, 
					alerttype: StatusName,
					
				});
 	   }else{console.log("Machine details is NULL for sendEmail() ")}
 });
 }
   
   /**
	 * This method is used for send Alert through SMS
	 * 
	 */
   	 var sendSms = function(data,StatusName,phoneNo,alarmType){  
   		 console.log("Inside sendSms()");
   		 var resourceId;
   		if(StatusName == config.vmstatusavailable)
   		{
   			resourceId = data.from.resource;
   			privateForSendSms(resourceId,data,StatusName,phoneNo,alarmType)
   		}
   	  else if(StatusName == config.vmstatusunavailable)
   		  {
   		  	resourceId = data.from.resource;
   		  	privateForSendSms(resourceId,data,StatusName,phoneNo,alarmType);
   		  }else if(StatusName == config.itemstatusout || StatusName == config.itemstatusreorder || StatusName == config.itemstatusbelowreorder)
   		  {
   			    resourceId = data.from.resource;
   			    privateForSendSms(resourceId,data,StatusName,phoneNo,alarmType);
   			  }
   		  	else
   			  {
   			  resourceId = data.payload.Resource_ID;
   			  privateForSendSms(resourceId,data,StatusName,phoneNo,alarmType)
   			  }
   		  
		  
		  	
   	 };

   	 
   	/**
   	 * 
   	 */
   	 var privateForSendSms = function(resourceId,data,StatusName,phoneNo,alarmType)
   	 {
   		 console.log("Inside privateForSendmail")
   		VendingMachine.getMachine(resourceId, function(err, machineDtls) {
	  		if(err)console.log("The errors are to fined details machine in sendSms()  "+err)
		  		
	  		  	if(machineDtls.length > 0){
	  		  		
		  			sms.sendSMS(phoneNo,machineDtls,StatusName)
		  			
	  		  	}else{console.log("Machine details is NULL for sendSms() ")}
	  	});
   	 }
   	 
 
/**
* This method is used for send Alert through SMS as well as Email
* 
*/
   	 
var sendAlertEmailSms = function(data,StatusName,emailAddress,phoneNo,alarmType) {
	console.log("Inside sendAlertEmailSms()" +StatusName)
	var resourceId;
	if(StatusName == config.vmstatusavailable)
		{
			resourceId = data.from.resource;
			privateForSendEmailSms(resourceId,data,StatusName,emailAddress,alarmType,phoneNo)
		}
	  else if(StatusName == config.vmstatusunavailable)
		  {
		  	resourceId = data.from.resource;
		  	privateForSendEmailSms(resourceId,data,StatusName,emailAddress,alarmType,phoneNo);
		  	
		  }else if(StatusName == config.itemstatusout || StatusName == config.itemstatusreorder || StatusName == config.itemstatusbelowreorder)
		  {
			    resourceId = data.from.resource;
			    privateForSendEmailSms(resourceId,data,StatusName,emailAddress,alarmType,phoneNo);
			  }
		  	else
			  {
			  resourceId = data.payload.Resource_ID;
			  privateForSendEmailSms(resourceId,data,StatusName,emailAddress,alarmType,phoneNo)
			  }

	
		
	
 };

 
 var privateForSendEmailSms = function(resourceId,data,StatusName,emailAddress,alarmType,phoneNo)
	 {
		 console.log("Inside privateForSendmailSMS")
		 VendingMachine.getMachine(resourceId, function(err, machine) {
				//console.log("machine details in sendAlertEmailSms "+machine)
				if(err)console.log("The errors are to fined details machine in sendAlertEmailSms()  "+err)
		  		
				  	if(machine.length > 0){
				  		
						    mailer.send(emailAddress,{
							machine: machine, 
							alerttype: StatusName,
						 });
				
						    sendSms(data,StatusName,phoneNo,alarmType);
				  		}else{console.log("Machine details is NULL for sendAlertEmailSms() ")}
				  	});
	 };

	
	