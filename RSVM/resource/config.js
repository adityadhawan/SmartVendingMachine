var config = {};
var prop = require('../util/loadproperties');

config.sitename = 'Swarm Server App';
config.mongodb = 'mongodb://localhost:27017/RSVM_DB'; //replace DBname with name of database initiated in mongodb
config.port = process.env.PORT || 3000;

config.header = {"x-bugswarmapikey": "af5c89f8b0bb88066d11b160252572ef03c5cdfd"};//Tarik
//config.header = {"x-bugswarmapikey": "bb044455058d0e0d4499f987fb4f99f987d52a87"};//Ritesh
/*
config.swarm = {		 
		 apikey: 'e08cb49ed711ace2ec273f21495823485c116733', //input producer API key
		 resource: '2cb49888517ec2b889fdceb23ede3fa6210ff6e8', //input resource ID for server app
		 swarms: ['f9a6f0837d8792aff157acc4a65bfaf008e04b06'] //keep blank - set in app.js
};
*/
config.swarm = {
		 apikey: '8f5fb6e20bd86ba2f2e5c6e87e86e9937ac9b331', //input producer API key
		// resource: '859f06e984001e2e7c25bc0075b1bfb9605c6f9e', //input resource ID for server app
		 resource:'eb1f55ea6a6e93d95493dc117e7fe2d80abaaae2',
		 swarms: ['7e509615ff888f18b2cf3d34903d2d9c588e65a5'] //keep blank - set in app.js
};


//using sendgrid with Nodemailer
config.mailer = {
    sender: 'ritesh2ranjan@gmail.com', //input name to appear in email's Sender field
    host: 'smtp.sendgrid.net',
    port: 587,
    use_authentication: true,
    user: '', //input Sendgrid credentials
    pass: '',
    subject:'Vending Machine Alert',
    template:'alert_email.ejs',
    image:'topImage.png'
    //template:'Testmail.ejs'
    
};
config.resourceinfourl = 'http://api.bugswarm.com/resources/';
config.twilioaccountsid = 'AC37065111bbf1ccd9209149c2388842f5';
config.twilioauthtoken = 'f81638201812da6e44b031ef0d902c51';
config.twiliophone = '(262) 394-1021';
config.itemstatusout = 'Out Of Stock';
config.itemstatusreorder = 'Re-order';
config.itemstatusbelowreorder = 'Below Re-order';
config.itemstatusok = 'OK';
config.priorityout = '3';
config.priorityreorder = '1';
config.prioritybelowreorder = '2';
config.priorityok = '0';
config.vmstatuscoindjam = 'Coin Jam';
config.vmstatusunabletodispense = 'Unable to Dispense';
config.alertstatusactive = 'active';
config.alertstatusdeactive = 'deactive';
config.vmstatusavailable = 'available';
config.vmstatusunavailable = 'unavailable';
config.vmstatuserror = 'Error';
config.alarmtypeemail = 'Email';
config.alarmtypephone = 'Sms';
config.alarmtypeboth = 'Email-Sms';
//config.testname =prop.getProperties("flavor");

//console.log("333333333333333333    "+prop.getProperties("beverage"));
//set secret for express module cookie <see http://expressjs.com/api.html>
config.cookiesecret = '';

module.exports = config;