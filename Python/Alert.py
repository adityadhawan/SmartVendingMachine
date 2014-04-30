import time
import ConfigParser
from lib import swarmtoolscore
from time import strftime,gmtime
from ConfigParser import SafeConfigParser
cfStatus = ConfigParser.ConfigParser() 
resource_id = ""
swarm_id = ""
from random import randint

class Alert:
    def __init__(self):
        global hostname, keys, swarm_id
        hostname = swarmtoolscore.get_server_info()
        keys = swarmtoolscore.get_keys()
        cf = ConfigParser.ConfigParser()
        cf.read("config.cfg")  
        #resource_id=cf.get("Swarm", "resource_id")
        swarm_id = cf.get("Swarm", "swarm_id")
        

    def sendAlert(self,errorType,status):
        global resource_id,swarm_id   
        #cf1=ConfigParser.ConfigParser()
        #cf1.read('stock.cfg')
        #inputFolderLocation = cf1.get(resource_id, "inputfolder")
        t= time.time()
        currentTime =  strftime("%Y-%m-%d %H:%M:%S", gmtime(t))
        fileName = strftime("%Y%m%d%H%M%S", gmtime(t))
        #fileLocation = "InputFolder/"+fileName+".txt"
        fileLocation = resource_id+"/Input/"+fileName+".txt"
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
    
    def main(self):
        global resource_id, obj, swarm_id
        resource_ids = []
        resource_status = []
        maxCounter = 0
        i = 1
        CounterCoupon = 101
        productCounter = 101
        amountRecCounter = 1
        counter = 0
        status = '0'
        cf1 = SafeConfigParser()
        cf1.read('status.cfg')
        for name, value in cf1.items("Status"):
            resource_ids.append(name) 
            resource_status.append(value)
            maxCounter = maxCounter + 1
        resource_id = resource_ids[counter]
        print resource_id
        length = len(resource_ids)    
        print length
        while(True):
            counter = randint(0,length-1) 
            print counter
            status = resource_status[counter]
            if(status == '1'):
                resource_id = resource_ids[counter]
                cfStatus = ConfigParser.ConfigParser() 
                cfStatus.read("status.cfg")
                cfStatus.set("Status", resource_id, "0")
                f = open('status.cfg', 'w')
                cfStatus.write(f)
                f.close()
                error_type = "Coin Jam"
                status = "Error"
                obj.sendAlert(error_type,status)
                resource_status[counter] = '0'
                print "Alert Generated"
                #if(counter == maxCounter-1):
                 #   counter = 0
                #else:
                 #   counter = counter + 1
            else:
                print "Machine is Blocked"
                selectedChoice="$$$$"
                if(selectedChoice == "$$$$"):
                    resource_id = resource_ids[counter]
                    error_type = "None"
                    status = "available"
                    cfStatus = ConfigParser.ConfigParser() 
                    cfStatus.read("status.cfg")
                    cfStatus.set("Status", resource_id, "1")
                    f = open('status.cfg', 'w')
                    cfStatus.write(f)
                    f.close()
                    obj.sendAlert(error_type,status)
                    resource_status[counter] = '1'
                    print "Error Resolved"
                    status = '1'
                else:
                    print ""
                  #  if(counter == maxCounter-1):
                   #     counter = 0
                    #else:
                     #   counter = counter + 1
            time.sleep(300)

obj = Alert()
obj.main()        
