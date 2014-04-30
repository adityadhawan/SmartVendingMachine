
/**
 * Module dependencies.
 */

//var prop = require('./util/loadproperties');
   //prop.loadProperties();
   
   
var express = require('express')
	
   , MongoStore = require('connect-mongo')(express)
  , mongoose = require('mongoose')
  // Models need to be added to the instance of mongoose that connects.
  , models = require('./models/models').mongoose
  , http = require('http')
  , path = require('path')
  , swarmconnector = require('./controler/SwarmConnector')
  , config = require('./resource/config')
 
  ,couponvalidator = require('./services/CouponValidateService')
  ,Scheduler = require('./scheduler/schedulerJob')
  
mongoose.connect(config.mongodb, function(err) {
	  if (err) throw err;
	  console.log('Connected to '+config.mongodb);
	  swarmconnector.connect(config.swarm); //initiates connection to Swarm
	   // swarmconnector.connect(config.swarm);
	 
	  
	});  


var app = express();

// all environments
//app.use(log4js.connectLogger(log, { level: log4js.levels.DEBUG })); 

//app.use(express.logger({stream: logFile}));
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'models')));
app.use(express.static(path.join(__dirname, 'resource')));
app.use(express.static(path.join(__dirname, 'util')))
app.engine('html', require('ejs').renderFile);
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/users', user.list);
//app.get('/isCouponValid/:param', couponvalidator.isCouponValid);


var  routes = require('./routes');
routes.setRoutes(app);
routes.couponValidatorService(app);
routes.users(app);
routes.alertconfig(app);
routes.vmunavailable(app);
routes.inventorymonitoring(app);
routes.VMcoupon(app);
routes.VMavailability(app);
routes.DashboardChart(app);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  
});
