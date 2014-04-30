var mongoose = require( 'mongoose' ); 
var Schema = mongoose.Schema;
//var prop = require('../util/loadproperties.js');
/*module.exports = function(mongoose) {*/
//prop.getProperties("Module");
    var ObjectId = Schema.ObjectId;
    
    var TxnIdSchema = new mongoose.Schema({
        _id: String,
        next: {type: Number}
    });

    TxnIdSchema.statics.increment = function (counter, callback) {
        return this.findByIdAndUpdate(counter, { $inc: { next: 1 } }, {"new": true, upsert: true, select: {next: 1}}, callback);
    };

    var VendingMachineSchema = new Schema({
    	resourceid: 	{type: String, required: true,index: true, unique: true },
        swarmid: 	    {type: String, required: true},
        latitude:		{type: Number},
        longitude:  	{type: Number},
        region:			{type: String},
        name:			{type: String},
        location:		{type: String},
        status:			{type: String},
        address:        {type:String},
        VMStatus_time:			{type: Date,required: true, index: true},
        InventoryStatus_time:	{type: Date,required: true, index: true},
        inventory_status:{type:String,"default": 'Out of Stock' }
        
         
    });
    VendingMachineSchema.statics.getMachine = function(resource_id, callback) {
    	VendingMachine.find({resourceid: resource_id}, 
    			function(err, data) {
    		            callback(err, data);
    	     });
         };
    
         VendingMachineSchema.statics.getInventoryStatusById = function(resource_id, callback) {
         	VendingMachine.find({_id: resource_id}, 
         			function(err, data) {
         		            callback(err, data);
         	     });
              };
  
              
              VendingMachineSchema.statics.getRegionByName = function(vmName, callback) {
               	VendingMachine.find({name: vmName}, 
               			function(err, data) {
               		            callback(err, data);
               	     });
                    };
                    
                    
         var ItemSchema = new Schema ({
         	item:             {type:String , required: true, index: true},
         	category:	      {type: String,required: true},
         	price:			  {type: String,required: true}
         	 
         });
         
         ItemSchema.statics.getItemID = function(itemName, callback) {
          	Item.find({item: itemName}, 
          			function(err, ItemID) {
          		     callback(err, ItemID);
          	     });
               };
       
               ItemSchema.statics.getItemDetails = function(callback) {
                 	Item.find({}, 
                 			function(err, ItemDetails) {
                 		     callback(err, ItemDetails);
                 	     });
                      };
    	
    var TransactionSchema = new Schema({
        txnid:        {type: Number, required: true, index: true},
        resource_id:  {type: String},
        item:         {type: String},
        time:         {type: Date},
        unitprice:    {type: Number}
               
    });
   
    TransactionSchema.statics.getIdByTxnId = function(txnId, callback) {
    	Transaction.find({txnid: txnId}, 
    			function(err, data) {
    		            callback(err, data);
    	     });
         };
         

    
    
	
    var InventorySchema = new Schema({
        itemid:          [{type: ObjectId, ref:'Item'}],
        resource_id:     [{type: ObjectId, ref:'VendingMachine'}],
    	units:           {type: Number, required: true, index: true},
        reorderlevel:    {type: Number,"default": 5},
        reordertime:     {type: String,"default": '3h' },
        status:			 {type: String}
        
    });
    
    InventorySchema.statics.getInventoryDtlByItemAndResorce = function(item_id,resource_id, callback) {
    		Inventory.find({itemid : item_id,resource_id: resource_id}).select('units reorderlevel resource_id itemid')
    		.exec(function(err, data) {
    		 callback(err, data);
    	    });
       };
    
    
    var ReplenishmentHistorySchema = new Schema({
    	units:           {type: Number},
    	time:            {type: Date},
    	resource_id:     [{type: ObjectId, ref: 'VendingMachine'}],
    	itemid:          {type: String}
       
    });
    
    
        
    var StockOutHistorySchema = new Schema({
    	
    	time:            {type: Date,required: true, index: true},
    	units:			 {type: Number},
    	reorderlevel:    {type: Number},
        status:   		 {type: String},
        resource_id:     [{type: ObjectId, ref:'VendingMachine'}],
        itemid:          {type: String}
    	
    });
    
    
    
    var StatusHistorySchema = new Schema({
    	errorcode:		 {type: String},
    	time:            {type: Date,required: true, index: true},
    	resource_id:     [{type: mongoose.Schema.Types.ObjectId, ref: 'VendingMachine'}],
    	status_id: 		[{type: mongoose.Schema.Types.ObjectId, ref: 'VMStatus'}]
    });
    
    
    var VendingMachineDetailSchema = new Schema({
    	resourceid: 	{type: String, required: true,index: true},
        swarmid: 	    {type: String, required: true},
        latitude:		{type: Number},
        longitude:  	{type: Number},
        region:			{type: String},
        name:			{type: String},
        location:		{type: String},
        status:			{type: String},
        address:        {type:String},
        items:          {type:String}
        
         
    });
    VendingMachineDetailSchema.statics.getMachine = function(resource_id, callback) {
    	VendingMachineDetail.find({resourceid: resource_id}, 
    			function(err, data) {
    		            callback(err, data);
    	     });
         };
  
         var AlertSchema = new Schema({
         	
         	name:			 {type:String },
         	time: 			 {type: Date, required: true, index: true},
         	description:	 {type: String},
         	resource_id:     [{type: mongoose.Schema.Types.ObjectId, ref: 'VendingMachine'}]
         	
         });
         
         var AlertConfigSchema = new Schema({
         	name:            {type: String, required: true, index: true},
         	userlist:		 [{type: ObjectId,ref: 'User'}],
         	//userlist:		 {type: String},
         	vm_status: 		 [{type: ObjectId, ref: 'VMStatus'}],
         	alarm_type:	     [{type: ObjectId, ref: 'AlarmType'}],
         	alerttext:       {type: String},
         	alertstatus:     {type: String},
         	inventory_status: [{type: ObjectId, ref: 'InventoryStatus'}],
         	allstatus:        {type: ObjectId} 
         	
         });
         AlertConfigSchema.statics.getAlertConfigName = function(name, callback) {
        	 AlertConfig.find({name: name}, 
          			function(err, data) {
          		            callback(err, data);
          	     });
               };
         
       AlertConfigSchema.statics.getAlertConfigNameById = function(Id, callback) {
              	AlertConfig.find({allstatus: Id}, 
              			
                			function(err, data) {
              		            //console.log("All Status "+data);
                		            callback(err, data);
                	     });
                     };
         
            var AlarmTypeSchema = new Schema({
         	 name:		     {type: String,required: true, index: true}
         });
         
            AlarmTypeSchema.statics.getAlarmTypeIdByName = function(alarmName, callback) {
           	 AlertConfig.find({name: alarmName}, 
             			function(err, data) {
             		            callback(err, data);
             	     });
                  };
            
         
                  
         var VMStatusSchema = new Schema({
         	status:		     {type: String,required: true, index: true}
         });
         
         
         VMStatusSchema.statics.getStatusIdByName = function(statusName, callback) {
        	 VMStatus.find({status: statusName}, 
          			function(err, data) {
          		            callback(err, data);
          	     });
               };
         
        
  var CouponSchema = new Schema({
    	code:			 {type: String,required: true, index: true, unique: true},
    	genratedon:      {type: Date},
    	item:			 {type: String},
    	consumedon:      {type: Date},
        transaction_id:  [{type: ObjectId, ref: 'Transaction'}],
        resource_id:     [{type: ObjectId, ref: 'VendingMachine'}],
        resource_name:   {type:String},
        resource_region: {type:String}
        
    	
    });
  
  CouponSchema.statics.getIdByCouponCode = function(couponCode, callback) {
  	Coupon.find({code: couponCode,resource_name:null}, 
  			function(err, data) {
  		            callback(err, data);
  	     });
       };
       
    
  var GoalSchema = new Schema({
    	resource_id:     {type: String, required: true, index: true},
    	itemid:          {type: String},
    	quater:		     {type: Number},
    	goal:            {type: Number},
    	sale:            {type: Number},
    	year:			 {type:String}
    });

  var UserSchema = new Schema({
  	name:            {type: String, required: true, index: true},
  	email:           {type: String},
  	phone:		     {type: Number}
  	
  });
        
  var InventoryStatusSchema = new Schema({
	  status:{type: String,required: true, index: true}
	  
  });
   
  InventoryStatusSchema.statics.getStatusIdByName = function(statusName, callback) {
	  InventoryStatus.find({status: statusName}, 
   			function(err, data) {
   		            callback(err, data);
   	     });
        };
        
        InventoryStatusSchema.statics.getStatusIdByName1 = function(statusName, callback) {
      	  InventoryStatus.find({status: statusName}, 
         			function(err, data) {
      		      //  console.log("@@@@@@@@@@@@@@@@  "+data)
      		       // console.log("data length  "+data.length)
      		       if(data.length == 0){
      		    	      VMStatus.getStatusIdByName(statusName,function(err,data){
      		    	      //console.log("#################  "+data)
         		            callback(err, data);
      		    	  });
      		       }
      		       else
      		          callback(err, data);
      	  });
      	
      };
   
      var MockServiceMgmtSchema = new Schema({
      	  ticketid: 	    {type: Number, required: true, index: true },
          resource_id: 	    {type: String, required: true},
          assignedto:		{type: String,"default": 'John'},
          requestdate:  	{type: Date,"default": Date.now},
          description:		{type: String,"default": 'Machine is out of order'},
          approver:			{type: String,"default": 'Nadine'},
          status:		    {type: String},
          machinename:		{type:String},
          machineaddress:	{type:String},
          machineregion:	{type:String},
          ticketstatus:		{type:String,"default": 'In Process'}
                   
      });
      
      var TicketIdSchema = new mongoose.Schema({
          _id: String,
          next: {type: Number}
      });

      TicketIdSchema.statics.increment = function (counter, callback) {
          return this.findByIdAndUpdate(counter, { $inc: { next: 1 } }, {"new": true, upsert: true, select: {next: 1}}, callback);
      };
      
      
    var VendingMachine = mongoose.model('VendingMachine', VendingMachineSchema);
    var Item = mongoose.model('Item', ItemSchema);
    var Transaction = mongoose.model('Transaction', TransactionSchema);
    var Inventory = mongoose.model('Inventory', InventorySchema);
    var TxnId = mongoose.model('TxnId', TxnIdSchema);
    
    var ReplenishmentHistory = mongoose.model('ReplenishmentHistory', ReplenishmentHistorySchema);
    
    var StockOutHistory = mongoose.model('StockOutHistory', StockOutHistorySchema);
    var VMStatus = mongoose.model('VMStatus', VMStatusSchema);
    var StatusHistory = mongoose.model('StatusHistory', StatusHistorySchema);
    var AlarmType = mongoose.model('AlarmType', AlarmTypeSchema);
    var VendingMachineDetail = mongoose.model('VendingMachineDetail', VendingMachineDetailSchema);
    var Alert = mongoose.model('Alert', AlertSchema);
    var AlertConfig = mongoose.model('AlertConfig', AlertConfigSchema);
    var Coupon = mongoose.model('Coupon', CouponSchema);
    var Goal = mongoose.model('Goal', GoalSchema);
   
    var User = mongoose.model('User', UserSchema);
    var InventoryStatus = mongoose.model('InventoryStatus', InventoryStatusSchema);
    var MockServiceMgmt = mongoose.model('MockServiceMgmtSchema', MockServiceMgmtSchema);
    var TicketId = mongoose.model('TicketId', TicketIdSchema);
    
   
  

   