var log4js = require('log4js');

log4js.configure({
	appenders:[
	           { type: 'console' 
	           },
	           { type: 'file', 
	        	 filename: "./public/log/RSVM.log", 
	        	 category: 'RSVM' ,
	        	 "maxLogSize": 1024,
	             "backups": 3
	        	}
	           ]
});
var logger  = log4js.getLogger('RSVM');         
   logger.setLevel('DEBUG');     
   Object.defineProperty(exports, "LOG", {      
   value:logger, }); 