
var mongoose = require('mongoose'),
Coupon = mongoose.model('Coupon')

var isCouponValid = function(req,res){
	console.log("Parameter");
	console.log("req "+req.params.param);
	 Coupon.find({consumedon: null,code:req.params.param})
	//Coupon.find({code:req.params.param})
	  .exec(function (err, couponDetails) {
		  if(err)console.log("Problem in Coupon Validation  "+err);
		  	res.contentType('json');
		  	console.log("couponDetails "+couponDetails);
        	res.send({ CouponStatus:couponDetails });
	  });
};



exports.setRoutes = function(app) {
	
	app.get('/isCouponValid/:param', isCouponValid);
   
};