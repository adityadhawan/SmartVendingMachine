var mongoose = require('mongoose'),
   User = mongoose.model('User'),
AlertConfig = mongoose.model('AlertConfig');
var logger= require('./../resource/logger.js');
var log=logger.LOG;

var getUserList = function(req,res){
	log.info("Inside getUserList() of UserAdmin.js");
	User.find({})
	  .exec(function (err, userList) {
		  if(err)log.error("Problem in getUserList() "+err);
		  	res.contentType('json');
		  	//console.log("userList "+userList);
        	res.send({ AllUsers:userList });
	  });
};

var addUser = function(req, res)
{
	log.info("Inside addUser() of UserAdmin.js");
	//console.log("addUser()      "+req.params.param);
	var userConfigData =JSON.parse(req.params.param);
	//var userArr = alertConfigData.UserList.split(',');
	new User({
		 	 name:     userConfigData.name,
		 	 email:    userConfigData.email,
		 	 phone :   userConfigData.phone
		    })
		      .save( function( err, User){
		          if (err) log.error("Error in addUser of UserAdmin.js "+err);
		      });
				res.contentType('json');
				res.send({ updateUser:"Success" });	
	};

	
	
	var updateUser = function(req, res)
	{
		log.info("Inside updateUser() of UserAdmin.js");
		//console.log("response Upadte::::"+req.params.param);
		
		var userConfigData =JSON.parse(req.params.param);
		//var userArr = userConfigData.UserList.split(',');
		User.findByIdAndUpdate( userConfigData._id,  {name : userConfigData.name,
			email : userConfigData.email, phone : userConfigData.phone}, 
			{ strict: false },
			function(err, numberAffected) {
			if (err)
				log.error("Error in update updateUser() of UserAdmin.js " + err);
				log.info("numberAffected in updateUser() of UserAdmin.js " + numberAffected);
			});
				res.contentType('json');
				res.send({ updateUser:"Success" });	
		};
	
		
		
var deleteUsers = function(req,res)
{
	log.info("Inside deleteUser() of UserAdmin.js");
	//console.log("Request    "+req.params.param);
	var userConfigData =JSON.parse(req.params.param);
	var DeleteAlertConfigArr = userConfigData._id.split(',');
	 var alertConfigidArr = combine_ids(DeleteAlertConfigArr);
	 //console.log("Arrray    "+eval(JSON.stringify (alertConfigidArr).replace (/"/g,'')))
	
	 User.remove({'_id' :{$in:(eval(JSON.stringify (DeleteAlertConfigArr).replace (/"/g,'')))}}).
				       exec(function(err, numberAffected) {
					if (err){
					     console.log("Error in update deleteUsers" + err);
					     return;
					}
					
					else{
						 if(numberAffected > 0)
						 {
							 console.log("numberAffected    "+numberAffected.length);
							 deleteUsersFromAlertConfig(req,res)
					    	// res.contentType('json');
							 //res.send({ deleteUser:"Success" });
						 }
					  }
					console.log("numberAffected  "+numberAffected)
					});
	};
	
	
	
	
var deleteUsersFromAlertConfig = function(req,res)
{
	console.log("response Upadte::::"+req.params.param);
	
	var alertConfigData =JSON.parse(req.params.param);
	var userArr = alertConfigData.name.split(',');
	 var useridArr = combine_ids(userArr);
	       User.where('name').in(eval(JSON.stringify (userArr).replace (/"/g,''))).select('_id')
			    .exec(function (err, UserIdList) {
				  if(err)console.log("Problem in get Inventory status  "+err);
				  	 var jsonText = JSON.stringify(UserIdList);
					  var jsonObject = JSON.parse(jsonText);
					  
					  if(UserIdList.length > 0 ){
						    jsonObject.forEach(function(jsonObject) {
						    	AlertConfig.update({}, 
						    		{$pull:{ userlist:new mongoose.Types.ObjectId((jsonObject._id).toString())}},
					  			
					  			{
					  				multi: true,
					  				upsert: false
					  				}
					  					, function(err, data,rwa){
					  					   console.log(err, data,rwa);
				  	});
				});
					  }//if
		 res.contentType('json');
		 res.send({ deleteUser:"Success" });	
  });
};


function combine_ids(ids) {
	for(var i=0;i<ids.length;i++) {
		ids[i] = "'"+ids[i].trim()+"'";
	}
	/*var value = (ids.length ? "\"" + ids.join("\",\"") + "\"" : "");
	console.log("Value        "+value)
	   return value;*/
	return ids;
}




exports.setRoutes = function(app) {	
	app.post('/getUserList', getUserList);
	app.post('/addUser/:param', addUser);
	app.post('/updateUser/:param', updateUser);
	app.post('/deleteUsers/:param', deleteUsers);
   
};
   