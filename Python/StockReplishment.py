import ConfigParser
from ConfigParser import SafeConfigParser
from lib import swarmtoolscore
import time
import httplib
import subprocess
import shlex
from time import strftime,gmtime
import os

cf = ConfigParser.ConfigParser()
cfStock = ConfigParser.ConfigParser()
maxStock = 10
conn = ""
hostname = ""
keys = ""
swarm_id =""

def getProduct(option):
    cf1 = ConfigParser.ConfigParser()
    cf1.read("config.cfg")  
    val=cf1.get("Products", option)  
    return val

def stopRunningProducers():
    f = open("OnlineProducersProcessId.cfg", "r+")
    producersProcessIds = f.readline()
    print "" +producersProcessIds
    if(producersProcessIds != ""):
        produersProcessId = producersProcessIds.split(",")
        for processId in produersProcessId:
            print "Process ID"+ str(processId)
            os.system("kill -9 "+str(processId))
        print "stopped"
    f.close()
    #f = open("OnlineProducersProcessId.cfg", "w+")
    #f.close()
            

def startMultipleProducers():
    cfStatus = SafeConfigParser() 
    cfStatus.read('status.cfg')
    for name, value in cfStatus.items("Status"):
        dispenseProducerObj = subprocess.Popen(shlex.split('python ' +  'Produce.py ' + name + ' &'))
        dispenseProduerProcessId = dispenseProducerObj .pid
        with open("OnlineProducersProcessId.cfg", "a") as myfile:
            myfile.write(str(dispenseProduerProcessId) +",")
        time.sleep(3)


def updateAll():       
    global maxStock, hostname, keys, swarm_id, conn
    #create_Connection()
    stopRunningProducers()
    startMultipleProducers()
    cf = ConfigParser.ConfigParser()
    cf.read("config.cfg") 
    swarm_id = cf.get("Swarm", "swarm_id")
    #hostname = swarmtoolscore.get_server_info()
    #keys = swarmtoolscore.get_keys()
    cfStock.read('stock.cfg')
    for resource_id in cfStock.sections():
        for name, value in cfStock.items(resource_id):
            if((name == "inputfolder") or (name == "processingfolder") or (name == "processedfolder")):
                print ""
            else: 
                cfStock.set(resource_id, str(name), str(maxStock))
                f = open('stock.cfg', 'w')
                cfStock.write(f)
                f.close()
                print name
                productName = getProduct(name)
                print productName
                t= time.time()
                currentTime =  strftime("%Y-%m-%d %H:%M:%S", gmtime(t))
                fileName = strftime("%Y%m%d%H%M%S", gmtime(t))
                #fileLocation = "InputFolder/"+fileName+".txt"
		fileLocation = resource_id+"/Input/"+fileName+".txt"
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
            #msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Resource_ID" : "' + resource_id + '","Swarm_ID":"' + swarm_id + '","Product_Name":"' + productName + '","Units_Replenished":"' + str(maxStock) + '"}}}\r\n'
            #size = hex(len(msg))[2:] + "\r\n"
            #chunk = msg + "\r\n"
            #conn.send(size+chunk)
            #print "sending"
            #time.sleep(5)
            #print "send"
    #close_Connection()

def updateSelected(resource_ids):
    print "in updated res"
    global maxStock, hostname, keys, swarm_id, conn
    #create_Connection()
    cf = ConfigParser.ConfigParser()
    cf.read("config.cfg") 
    swarm_id = cf.get("Swarm", "swarm_id")
    #hostname = swarmtoolscore.get_server_info()
    #keys = swarmtoolscore.get_keys()
    cfStock.read('stock.cfg')
    for resource_id in resource_ids:
        for name,value in cfStock.items(resource_id):
            if((name == "inputfolder") or (name == "processingfolder") or (name == "processedfolder")):
                print ""
            else:
                cfStock.set(resource_id, str(name), str(maxStock))
                f = open('stock.cfg', 'w')
                cfStock.write(f)
                f.close()
                print name
                productName = getProduct(name)
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
            #msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Resource_ID" : "' + resource_id + '","Swarm_ID":"' + swarm_id + '","Product_Name":"' + productName + '","Units_Replenished":"' + str(maxStock) + '"}}}\r\n'
            #print msg;
            #size = hex(len(msg))[2:] + "\r\n"
            #chunk = msg + "\r\n"
            #conn.send(size+chunk)
            #print "sending"
            #time.sleep(5)
            #print "send"
    #close_Connection()
    
    
