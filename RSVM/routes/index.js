
var frontendRoutes = require('./frontendRoutes');
var couponvalidator = require('../services/CouponValidateService');
var useradmin = require('../admin/UserAdmin');
var alertconfig = require('../admin/AlertConfig');
var vmunavailable = require('../dashboard/VMUnavailability');
var inventorymonitoring = require('../dashboard/InventoryMonitoring');
var VMcoupon = require('../dashboard/VMCoupon');
var VMavailability = require('../dashboard/VMAvailability');
var DashboardChart = require('../dashboard/DashboardChart');



exports.setRoutes = function(app) {
   
frontendRoutes.setRoutes(app);

};

exports.couponValidatorService = function(app) {
	 couponvalidator.setRoutes(app);

};

exports.users = function(app) {
	   
	useradmin.setRoutes(app);

};

exports.alertconfig = function(app) {
	   
	alertconfig.setRoutes(app);

};

exports.vmunavailable = function(app) {
	   
	vmunavailable.setRoutes(app);

};

exports.inventorymonitoring = function(app) {
	   
	inventorymonitoring.setRoutes(app);

};

exports.VMcoupon = function(app) {
	   
	VMcoupon.setRoutes(app);

};

exports.VMavailability = function(app) {
	   
	VMavailability.setRoutes(app);

};

exports.DashboardChart = function(app) {
	   
	DashboardChart.setRoutes(app);

};


