'''
Created on Jan 5, 2014

@author: Aditya
'''
import time
import ConfigParser
import httplib
from lib import swarmtoolscore
from time import strftime,gmtime
from ConfigParser import SafeConfigParser
import Validate
hostname = ""
keys = ""
swarm_id =""
resource_id = ""
balanceAmount = 0
receivepayment = 0
productName = 0
productBalance = 0
productPrice = 0
productId = 0
maxStock = 10
conn =""
cf = ConfigParser.ConfigParser()


class Emulator:
    'Emulator class'
    
    def __init__(self):
        global hostname, keys, swarm_id, resource_id
        hostname = swarmtoolscore.get_server_info()
        keys = swarmtoolscore.get_keys()
        cf.read("config.cfg")  
        resource_id=cf.get("Swarm", "resource_id")
        swarm_id = cf.get("Swarm", "swarm_id")
        
    def checkStock(self,option):
        cf.read("config.cfg")  
        val=cf.get("Product_Stock", option)
        return val
        
    def updateStock(self,option,val):    
        cf.read('config.cfg')
        cf.set("Product_Stock", option, int(val)-1)
        f = open('config.cfg', 'w')
        cf.write(f)
        f.close()
            
    
    def getProduct(self,option):
        cf.read("config.cfg")  
        val=cf.get("Products", option)  
        return val
    
    def getPrice(self,option):
        cf.read("config.cfg")  
        val=cf.get("Products_Price", option)  
        return val
    
    def isInteger(self,amountRecived):
        try:
            float(amountRecived)
            return True
        except:
            return False
    
    def isValidProduct(self,selectedChoiceMenu):
        global obj2
        try:
            obj2.getProduct(selectedChoiceMenu)
            return True
        except:
            return False
 
    def ISTransactionAuthorized(self,couponCode):
        global productName, productId
        isCouponValid = False
        print "Coupon Verification in Progress"
        json_obj = Validate.validateCoupon(couponCode,resource_id)
        #json_obj = Producer.validateCoupon(couponCode)
        if(json_obj["CouponStatus"]):
            print "Coupon Accepted"
            productName = json_obj["CouponStatus"][0]["item"]
            cf = SafeConfigParser()
            cf.read('config.cfg')
            for section_name in cf.sections():
                for name, value in cf.items(section_name):
                    if(value == productName):
                        print "Item found"
                        productId = name
                        print productId
                        break
                    
            isCouponValid = True
        else:
            isCouponValid = False
        return isCouponValid
        
    def CouponTransactionAuthorization(self,productId):
        obj = Emulator()
        checkStock = obj.checkStock(productId)
        if(int(checkStock) > 0):
            #print "In Stock ",checkStock
            return True
        else:
            obj.clear()
            return False
        
    def DispenseCouponProduct(self,couponCode,productId):
        obj = Emulator()
        #obj.clear()
        print "Coupon Code Verified"
        checkStock = obj.checkStock(productId)
        productName = obj.getProduct(productId)
        obj.updateStock(productId, checkStock)  
        obj.sendDataCoupon(couponCode, productName)
        print "Product Dispensed"
        time.sleep(3)
        obj.clear()
    
    
    def transactionAuthorization(self,selectedChoiceMenu,amountRecived):
        obj = Emulator()
        global balanceAmount, receivepayment, productName, productBalance, productPrice
        isAutihorized = True
        if(obj.isValidProduct(selectedChoiceMenu)):
            productName=obj.getProduct(selectedChoiceMenu)
            productBalance=obj.checkStock(selectedChoiceMenu)
            print "You selected ",productName
            if(int(productBalance) > 0):
                #print "In Stock ", productBalance
                productPrice = obj.getPrice(selectedChoiceMenu)
                #print "Product Price is ",productPrice
                if(float(amountRecived) >= float(productPrice)):
                    receivepayment = '224455'
                    if(receivepayment == '224455'):
                        isAutihorized = True
                    else:
                        isAutihorized = False
                    balanceAmount = float(amountRecived) - float(productPrice)
                else:
                    obj.clear()
                    print "Product Price is greater than ", amountRecived
                    print "Amount Refund ", amountRecived  
                    isAutihorized = False
            else:
                obj.clear()
                print "Out of Stock"
                isAutihorized = False
        else:
            obj.clear()
            print "Not a Valid Selection"
            isAutihorized = False
        return isAutihorized
        
    def DispenseItem(self,selectedChoiceMenu,amountRecived):
        obj = Emulator()
        #obj.clear()
        #print "Payment successful"
        obj.updateStock(selectedChoiceMenu, productBalance)
        obj.sendDataCash(productName,productPrice,amountRecived,balanceAmount)
        print "Balanced Amount ",balanceAmount
        print "Product Dispensed"
        time.sleep(3)
        obj.clear()
    
    def sendDataCoupon(self,couponCode,productName):
        t= time.time()
        currentTime =  strftime("%Y-%m-%d %H:%M:%S", gmtime(t))
        fileName = strftime("%Y%m%d%H%M%S", gmtime(t))
        fileLocation = "InputFolder/"+fileName+".txt"
        f = open(fileLocation,"w+")
        cf=ConfigParser.ConfigParser()
        cf.add_section("Details")
        cf.set("Details", "Type", "Coupon")
        cf.set("Details", "Resource ID", resource_id)
        cf.set("Details", "Payment Method", "Coupon")
        cf.set("Details", "Product Name", productName)
        cf.set("Details", "Coupon Code", couponCode)
        cf.set("Details", "Time", currentTime)
        cf.write(f)
        f.close()
        
    
    def sendDataCash(self,productName,productPrice,amountRecived,balanceAmount):
        t= time.time()
        currentTime =  strftime("%Y-%m-%d %H:%M:%S", gmtime(t))
        fileName = strftime("%Y%m%d%H%M%S", gmtime(t))
        fileLocation = "InputFolder/"+fileName+".txt"
        f = open(fileLocation,"w+")
        cf=ConfigParser.ConfigParser()
        cf.add_section("Details")
        cf.set("Details", "Type", "Cash")
        cf.set("Details", "Resource ID", resource_id)
        cf.set("Details", "Payment Method", "Cash")
        cf.set("Details", "Product Name", productName)
        cf.set("Details", "Product Price", productPrice)
        cf.set("Details", "Amount Received", amountRecived)
        cf.set("Details", "Balance Amount", balanceAmount)
        cf.set("Details", "Time", currentTime)
        cf.write(f)
        f.close()
    
    def sendAlert(self,errorType,status):
        t= time.time()
        currentTime =  strftime("%Y-%m-%d %H:%M:%S", gmtime(t))
        fileName = strftime("%Y%m%d%H%M%S", gmtime(t))
        fileLocation = "InputFolder/"+fileName+".txt"
        f = open(fileLocation,"w+")
        cf=ConfigParser.ConfigParser()
        cf.add_section("Details")
        cf.set("Details", "Type", "Alert")
        cf.set("Details", "Resource_ID", resource_id)
        cf.set("Details", "Swarm_ID", swarm_id)
        cf.set("Details", "Status", status)
        cf.set("Details", "Error_Type", errorType)
        cf.write(f)
        f.close()
    
        try:
            global conn
            #api_key=keys["participation"]
            #conn = httplib.HTTPConnection(hostname["hostname"])
            #sel = "/stream?swarm_id=%s&resource_id=%s"%(swarm_id, resource_id)
            #conn.putrequest("POST", sel)
            #conn.putheader("x-bugswarmapikey", api_key)
            #conn.putheader("transfer-encoding", "chunked")
            #conn.putheader("connection", "keep-alive")
            #conn.endheaders()
            #if(conn == ""):
            #    print "in if"
            #    createConnection()
            #msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Resource_ID" : "' + resource_id + '","Swarm_ID":"' + swarm_id + '","Status":"' + status + '","Error_Type":"' + errorType + '"}}}\r\n'
            #print msg
	    #size = hex(len(msg))[2:] + "\r\n"
            #chunk = msg + "\r\n"
            #conn.send(size+chunk)
            #print "sending"
            #time.sleep(5)
            #print "send"
        except:
            print "Some Error has Occured"
    
    def stockReplenishment(self):
        global maxStock
        obj = Emulator()
        cf1=ConfigParser.ConfigParser()
        cf1.read('config.cfg')
        for product_id, value in cf1.items("Product_Stock"):
            cf1.set("Product_Stock", str(product_id), str(maxStock))
            f = open('config.cfg', 'w')
            cf1.write(f)
            f.close()
            print product_id
            productName = obj.getProduct(product_id)
            print productName
            t= time.time()
            currentTime =  strftime("%Y-%m-%d %H:%M:%S", gmtime(t))
            fileName = strftime("%Y%m%d%H%M%S", gmtime(t))
            fileLocation = "InputFolder/"+fileName+".txt"
            f = open(fileLocation,"w+")
            cf=ConfigParser.ConfigParser()
            cf.add_section("Details")
            cf.set("Details", "Type", "StockReplishment")
            cf.set("Details", "Resource_ID", resource_id)
            cf.set("Details", "Swarm_ID", swarm_id)
            cf.set("Details", "Product_Name", productName)
            cf.set("Details", "Units_Replenished", str(maxStock))
            cf.write(f)
            f.close()
            time.sleep(1)
            
            #api_key=keys["participation"]
            #conn = httplib.HTTPConnection(hostname["hostname"])
            #sel = "/stream?swarm_id=%s&resource_id=%s"%(swarm_id, resource_id)
            #conn.putrequest("POST", sel)
            #conn.putheader("x-bugswarmapikey", api_key)
            #conn.putheader("transfer-encoding", "chunked")
            #conn.putheader("connection", "keep-alive")
            #conn.endheaders()
            #if(conn == ""):
            #   createConnection()
            #msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Resource_ID" : "' + resource_id + '","Swarm_ID":"' + swarm_id + '","Product_Name":"' + productName + '","Units_Replenished":"' + str(maxStock) + '"}}}\r\n'
            #print msg
            #size = hex(len(msg))[2:] + "\r\n"
            #chunk = msg + "\r\n"
            #conn.send(size+chunk)
            #print "sending"
            #time.sleep(5)
            #print "send"
        print "Stock Replenishment completed"
        time.sleep(3)
        obj.clear()
       
    
    def clear(self):
        import os
        os.system('clear')
        
    def printMenu(self):
        print "Select Your Choice"
        cf = SafeConfigParser()
        cf.read('config.cfg')
        for pro_id, pro_value in cf.items("Products"):
            price = cf.get("Products_Price", str(pro_id))
            print pro_id + " "+ pro_value + " - $" + price + "" 
               
    def mainMenu(self):
        print "Payment Mode"
        print "1 Pay Cash"
        print "2 Use Coupon"
        print "X for Exit"
    
    def main(self):
        obj1 = Emulator()
        selectedChoice=''
        isAlertOccured = False
        obj1.clear()
        while(selectedChoice!='X'):
            if(isAlertOccured):
                print "Machine in Blocked State"
                print "Resolve Alert First"
                selectedChoice=raw_input()
                if(selectedChoice == "$$$$"):
                    isAlertOccured = False
                    error_type = "None"
                    status = "available"
                    obj1.sendAlert(error_type,status)
                    obj1.clear()
                    print "Alert Resolved"
                    time.sleep(3)
                    obj1.clear()
            else:
                obj1.mainMenu()
                selectedChoice=raw_input()
                if(selectedChoice == '2'):
                    obj1.clear()
                    print "Enter your Coupon Code"
                    couponCode = raw_input()
                    isCouponAuthorized = obj1.ISTransactionAuthorized(couponCode)
                    if(isCouponAuthorized):
                        if(obj1.CouponTransactionAuthorization(productId)):
                            obj1.DispenseCouponProduct(couponCode,productId)
                        else:
                            print "Product Out of Stock"
                            time.sleep(3)
                            obj1.clear()
                    else:
                        print "Invalid Coupon"
                        time.sleep(3)
                        obj1.clear()
                        
                elif(selectedChoice == '1'):
                    obj1.clear()
                    print "Please Insert Money"
                    amountRecived = raw_input()
                    if(obj1.isInteger(amountRecived)):
                        obj1.clear()
                        obj1.printMenu()
                        productSelected = raw_input()
                        isTransactionAuthorized = obj1.transactionAuthorization(productSelected,amountRecived)
                        if(isTransactionAuthorized):
                            obj1.DispenseItem(productSelected,amountRecived)
                        else:
                            print "Transaction Authorization Fails"
                            time.sleep(3)
                            obj1.clear()
                    else:
                        print "Please Insert Valid Currency"
                        time.sleep(3)
                        obj1.clear()
                elif(selectedChoice == '####'):
                    obj1.clear()
                    print "Alert Generated"
                    isAlertOccured = True
                    error_type = "Coin Jam"
                    status = "Error"
                    obj1.sendAlert(error_type,status)
                elif(selectedChoice == 'S'):
                    print "Starting Stock Replenishment"
                    #print "Enter Product Id"
                    #product = raw_input()
		      #obj1.stockReplenishment(product)
                    obj1.stockReplenishment()
                elif(selectedChoice != 'X'):
                    obj1.clear()
                    print "This is not a valid selection"  
    
obj2 = Emulator()
obj2.main()
print "Thank you"    
