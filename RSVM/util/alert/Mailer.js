var config = require('../../resource/config');
//var mailer = require('nodemailer');
var nodemailer = require("nodemailer");
var ejs = require('ejs');
var fs = require('fs');


/*if (config.mailer.sendmail) {
    mailer.sendmail = true;
} else {
    mailer.SMTP = config.mailer;
}*/

var transport = nodemailer.createTransport("SMTP",{
	   service: "Gmail",
	   auth: {
		   user: "tariksingh@hotmail.com",
	       	 pass: "Techmm2m"

	   }
	});

/*var transport = nodemailer.createTransport("SMTP", {
    host: "smtp.gmail.com", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "ritesh2ranjan@gmail.com",
        pass: "lovesinghania"
    }
});*/


/**
* Sends the email
* @param {Object} mail The recipient and template configuration.
* @public
**/
/*module.exports.send = function (data) {
	console.log("Inside MAiler::::");
	smtpTransport.sendMail({
		   from: "ritesh2ranjan@gmail.com", // sender address
		   to: "rr00332115@techmahindra.com", // comma separated list of receivers
		   subject: "Hello", // Subject line
		   text: "This is test mail send through Node.js" // plaintext body
		}, function(error, response){
		   if(error){
		       console.log(error);
		   }else{
		       console.log("Message sent: " + response.message);
		   }
		});
};*/

/**
* Sends the email
* @param {Object} mail The recipient and template configuration.
* @public
**/

var mailOptions = {
	    from: config.mailer.sender, // sender address
	    subject: config.mailer.subject, // Subject line
	    template:config.mailer.template,
	    image:config.mailer.image
	}


module.exports.send = function (emailAddress,data) {
	//console.log("Data from send    "+JSON.stringify(data));
     // console.log("EmailAddrss from send    "+emailAddress);
    if (mailOptions.template) {
        var templatepath = __dirname+'//'+mailOptions.template;
        var imagepath = __dirname+'\\'+mailOptions.image;
        console.log(imagepath);
        var str = fs.readFileSync(templatepath, encoding="utf8");
         var img = fs.readFileSync(imagepath);
        data.filename = templatepath;
        mailOptions.html = ejs.render(str,data,img);
        mailOptions.generateTextFromHTML = true;
        mailOptions.to = emailAddress
        //mail.html = parsetmpl(mail.template);
    }
    transport.sendMail(mailOptions, function(error, success) {
        if (error || !success) {
            console.log("Email wasn't sent!  "+error);
            //console.log("==================="+mailOptions);
        }
    });
};

