import time
import ConfigParser
import httplib
from lib import swarmtoolscore
from time import strftime,gmtime
from ConfigParser import SafeConfigParser
import subprocess
import shlex
import sys
import Validate
from random import randint

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
cf = ConfigParser.ConfigParser()
cfUpdate = ConfigParser.ConfigParser()
cfStatus = ConfigParser.ConfigParser()

class Emulator:
    'Emulator class'
    
    def __init__(self):
        global hostname, keys, swarm_id
        hostname = swarmtoolscore.get_server_info()
        keys = swarmtoolscore.get_keys()
        cf.read("config.cfg")  
        #resource_id=cf.get("Swarm", "resource_id")
        swarm_id = cf.get("Swarm", "swarm_id")
        
    def checkStock(self,option):
        cf.read("stock.cfg")  
        val=cf.get(resource_id, option)
        return val
        
    def updateStock(self,option,val):    
        cfUpdate.read('stock.cfg')
        cfUpdate.set(resource_id, option, int(val)-1)
        f = open('stock.cfg', 'w')
        cfUpdate.write(f)
        f.close()            
    
    def getProduct(self,option):
        cf.read("config.cfg")  
        val=cf.get("Products", option)  
        return val
    
    def getPrice(self,option):
        cf.read("config.cfg")  
        val=cf.get("Products_Price", option)  
        return val
    
    def validateCoupon(self,couponCode):
        cf.read("config.cfg")  
        if(cf.has_option("Coupon", couponCode)):
            val=cf.get("Coupon", couponCode)
        else:
            val='0'  
        return val
    
    def ISTransactionAuthorized(self,couponCode):
        global productName, productId, resource_id
        isCouponValid = False
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
            print "In Stock ",checkStock
            return True
        else:
            #obj.clear()
            return False
        
    def DispenseCouponProduct(self,couponCode,productId):
        obj = Emulator()
        #obj.clear()
        print "Coupon Code Applied"
        checkStock = obj.checkStock(productId)
        productName = obj.getProduct(productId)
        obj.updateStock(productId, checkStock)  
        obj.sendDataCoupon(couponCode, productName)
        print "Product Dispensed"
    
    
    def transactionAuthorization(self,selectedChoiceMenu,amountRecived):
        obj = Emulator()
        global balanceAmount, receivepayment, productName, productBalance, productPrice
        isAutihorized = True
        productName=obj.getProduct(selectedChoiceMenu)
        productBalance=obj.checkStock(selectedChoiceMenu)
        print "You selected ",productName
        if(int(productBalance) > 0):
            print "In Stock ", productBalance
            productPrice = obj.getPrice(selectedChoiceMenu)
            print "Product Price is ",productPrice
            if(float(amountRecived) >= float(productPrice)):
                receivepayment = '224455'
                if(receivepayment == '224455'):
                    isAutihorized = True
                else:
                    isAutihorized = False
                balanceAmount = float(amountRecived) - float(productPrice)
            else:
                #obj.clear()
                print "Product Price is greater than ", amountRecived
                isAutihorized = False
        else:
            #obj.clear()
            print "Out of Stock"
            isAutihorized = False
        return isAutihorized
        
    def DispenseItem(self,selectedChoiceMenu,amountRecived):
        obj = Emulator()
        #obj.clear()
        print "Payment successful"
        obj.updateStock(selectedChoiceMenu, productBalance)
        obj.sendDataCash(productName,productPrice,amountRecived,balanceAmount)
        print "Balanced Amount ",balanceAmount
        print "Product Dispensed"
    
    def sendDataCoupon(self,couponCode,productName):
        cf1=ConfigParser.ConfigParser()
        cf1.read('stock.cfg')
        folderLocation = cf1.get(resource_id, "inputfolder")
        t= time.time()
        currentTime =  strftime("%Y-%m-%d %H:%M:%S", gmtime(t))
        fileName = strftime("%Y%m%d%H%M%S", gmtime(t))
        fileLocation = folderLocation+fileName+".txt"
        #fileLocation = "InputFolder/"+fileName+".txt"
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
        cf1=ConfigParser.ConfigParser()
        cf1.read('stock.cfg')
        folderLocation = cf1.get(resource_id, "inputfolder")
        t= time.time()
        currentTime =  strftime("%Y-%m-%d %H:%M:%S", gmtime(t))
        fileName = strftime("%Y%m%d%H%M%S", gmtime(t))
        fileLocation = folderLocation+fileName+".txt"
        #fileLocation = "InputFolder/"+fileName+".txt"
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
        time.sleep(1)
        #try:
         #   api_key=keys["participation"]
          #  conn = httplib.HTTPConnection(hostname["hostname"])
           # sel = "/stream?swarm_id=%s&resource_id=%s"%(swarm_id, resource_id)
            #conn.putrequest("POST", sel)
            #conn.putheader("x-bugswarmapikey", api_key)
            #conn.putheader("transfer-encoding", "chunked")
            #conn.putheader("connection", "keep-alive")
            #conn.endheaders()
            #msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Resource_ID" : "' + resource_id + '","Swarm_ID":"' + swarm_id + '","Status":"' + status + '","Error_Type":"' + errorType + '"}}}\r\n'
            #size = hex(len(msg))[2:] + "\r\n"
            #chunk = msg + "\r\n"
            #conn.send(size+chunk)
            #print "sending"
            #time.sleep(10)
            #print "send"
        #except:
         #   print "Some Error has Occured"
    
    def clear(self):
        import os
        os.system('clear')
        
    def printMenu(self):
        print "Select Your Choice"
        cf = SafeConfigParser()
        cf.read('config.cfg')
        for pro_id, pro_value in cf.items("Products"):
            print pro_id + " "+ pro_value
               
    def mainMenu(self):
        print "Payment Mode"
        print "1 Pay Cash"
        print "2 Use Coupon"
        print "X for Exit"
    
    def main(self):
        #print "sys "+sys.argv[1]
        global resource_id
        obj1 = Emulator()
        i = 1
        CounterCoupon = 101
        productCounter = 101
        amountRecCounter = 1
        counter = 0
        resourceStatus = '0'
        selectedChoice=''
        cf1 = SafeConfigParser() 
        #cf1.read('status.cfg')
        #for name, value in cf1.items("Status"):
         #   dispenseProducerObj = subprocess.Popen(shlex.split('python ' +  'Produce.py ' + name + ' &'))
         #    dispenseProduerProcessId = dispenseProducerObj .pid
          #  with open("OnlineProducersProcessId.cfg", "a") as myfile:
           #     myfile.write(str(dispenseProduerProcessId) +",")
            #time.sleep(3)
        
        while(selectedChoice!='X'):
            resource_ids = []
            resource_status = []
            maxCounter = 0
            #cf1 = SafeConfigParser()
            cf1.read('status.cfg')
            for name, value in cf1.items("Status"):
                resource_ids.append(name) 
                resource_status.append(value)
                maxCounter = maxCounter + 1
            resource_id = resource_ids[counter]
            
            #while(status != '1'):
            #    status = resource_status[counter]
            #    if(status == '1'):
            #        resource_id = resource_ids[counter]
             #   else:
              #      print "Machine is Blocked"
                #    selectedChoice="$$$$"
               #     if(selectedChoice == "$$$$"):
                 #       resource_id = resource_ids[counter]
                  #      error_type = "None"
                   #     status = "available"
                    #    cfStatus.read("status.cfg")
                     #   cfStatus.set("Status", resource_id, "1")
                      #  f = open('status.cfg', 'w')
                       # cfStatus.write(f)
                        #f.close()
                        #obj1.sendAlert(error_type,status)
                        #print "Error Resolved"
                       # status = '1'
                    #else:
                     #   if(counter == maxCounter-1):
                      #      counter = 0
                       # else:
                        #    counter = counter + 1
            
            resourceStatus = resource_status[counter]
            if(resourceStatus == '1'):
                obj1.mainMenu()
                if((i%5) == 0):
                    selectedChoice = '2'
                    i = i + 1
                else:
                    selectedChoice = '1'
                    i = i + 1
                #selectedChoice=raw_input()
                if(selectedChoice == '2'):
                    #obj1.clear()
                    print "Enter your Coupon Code"
                    cf.read("config.cfg")
                    couponCode = cf.get("CouponCode", str(CounterCoupon))  
                    #couponCode = raw_input()
                    isCouponAuthorized = obj1.ISTransactionAuthorized(couponCode)
                    if(isCouponAuthorized):
                        if(obj1.CouponTransactionAuthorization(productId)):
                            obj1.DispenseCouponProduct(couponCode,productId)
                        else:
                            print "Product Out of Stock"
                    else:
                        print "Invalid Coupon"
                    if(CounterCoupon == 106):
                        CounterCoupon = 101
                    else:
                        CounterCoupon = CounterCoupon + 1
                    
                elif(selectedChoice == '1'):
                    #obj1.clear()
                    print "Please Insert Money"
                    amountRecived = amountRecCounter
                    amountRecCounter = amountRecCounter + 1
                    if(amountRecCounter == 10):
                        amountRecCounter = 1
                    #amountRecived = raw_input()
                    #obj1.clear()
                    obj1.printMenu()
                    cf = SafeConfigParser()
                    cf.read("config.cfg")
                    productCounter = randint(101,106)
                    for name, value in cf.items("Products"):
                        if(str(productCounter) == name):
                            productSelected = name
                        
                    #if(productCounter == 106):
                    #    productCounter = 101
                    #else:
                    #    productCounter = productCounter + 1
                
                    #productSelected = raw_input()
                    isTransactionAuthorized = obj1.transactionAuthorization(productSelected,amountRecived)
                    if(isTransactionAuthorized):
                        obj1.DispenseItem(productSelected,amountRecived)
                    else:
                        print "Transaction Authorization Fails"
                elif(selectedChoice != 'X'):
                    #obj1.clear()
                    print "This is not a valid selection"  
                if(counter == maxCounter-1):
                    counter = 0
                else:
                    counter = counter + 1
                time.sleep(120)
            else:
                print "Machine in Blocked State"    
                if(counter == maxCounter-1):
                    counter = 0
                else:
                    counter = counter + 1

            
obj2 = Emulator()
obj2.main()
print "Thank you"    
