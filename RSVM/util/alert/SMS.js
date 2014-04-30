var config = require('../../resource/config'),
	twilio = require('twilio'),
client = new twilio.RestClient(config.twilioaccountsid, config.twilioauthtoken)



module.exports.sendSMS = function(phoneNo,machineDtls,configName)
{
	console.log("+=========   "+phoneNo);
	client.sms.messages.create({    
	 	body: " The machine "+machineDtls[0].name +"is "+ configName ,    
	 	to: phoneNo,
	 	from:config.twiliophone
	 	}, 
		 	function(err, message) {   
	 		if(!err){
	 			console.log("Success! to send SMS")
		    process.stdout.write(message.sid);
	 		}
	 		else
	 			console.log("There was problem  "+JSON.stringify(err))
	 	}); 
};
