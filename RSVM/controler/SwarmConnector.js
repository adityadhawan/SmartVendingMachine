
    	
var SwarmConnection = require('bugswarm-prt').Swarm
     config = require('../resource/config'),
     swarm = {},
	 swarmservice = require('../services/SwarmService'),
	 swarm = {},
	 swarmconnector = require('./SwarmConnector')

var secs = 0;
var interval = null;
var date = null;

var onmessage = function(message) {
	if(message.length !=0 )	
	 console.log("######### OnMessage call ###########");
	 swarmservice.swarmMessageControler(message);
	 

};

var onerror = function(error) {
    console.log(error);
};

var onconnect = function(err) {
    if (err){
        console.log('Error connecting to swarm: ',err);
    } else {
        console.log('Connected to swarm');
		if (interval) {
			clearInterval(interval);
		}
		interval = setInterval(heartbeat, 2000);
   }
};	

var seconds = 0;
var heartbeat = function() {
    //seconds ++;
    if (seconds++ % 30 == 1){
    	swarm.send({'keepalive':seconds});
    }
    //console.log('Seconds: ' + seconds + ', counter: ' +counter + ', missed ' +(seconds * 1000 / short - counter));
   // onconnect("Exception");
};

var onpresence = function(presence) {
    console.log("Presence"+JSON.stringify(presence));
   
    if(presence.type == config.vmstatusavailable )
    	{
    		
    	  swarmservice.isResourceNew(presence.from.resource,presence.type);
    	  swarmservice.saveAlert(presence,presence.type);
    	}
    else if(presence.type== config.vmstatusunavailable && presence.from.swarm !=null)
    	{
    	//console.log("print presence unavialbale  "+JSON.stringify(presence));
    	swarmservice.saveAlert(presence,presence.type);
    	
    	 
    	}
    
}; 
var ondisconnect = function() {
    console.log('Disconnected from swarm');
   // swarmconnector.connect(config.swarm); //initiates connection to Swarm
};

 			

exports.connect = function(config) {
        console.log('Connecting to swarm');
        date = new Date();
        swarm = new SwarmConnection(config);
        swarm.on('message', onmessage);
        swarm.on('error', onerror);
        swarm.on('connect', onconnect);
        swarm.on('presence', onpresence);
        swarm.on('disconnect', ondisconnect);
        swarm.connect();
        
};