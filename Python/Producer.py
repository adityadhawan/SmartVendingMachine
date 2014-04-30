from lib import swarmtoolscore
import httplib
import time
import shutil,os
import ConfigParser
import signal

conn =""
hostname = ""
keys = ""
swarm_id =""
resource_id = ""
cf = ConfigParser.ConfigParser()


def create_Connection():
    global hostname, keys, swarm_id, resource_id, conn
    print "in create connection"
    hostname = swarmtoolscore.get_server_info()
    keys = swarmtoolscore.get_keys()
    api_key=keys["participation"]
    cf.read("config.cfg")  
    resource_id=cf.get("Swarm", "resource_id")
    swarm_id = cf.get("Swarm", "swarm_id")
    conn = httplib.HTTPConnection(hostname["hostname"])
    sel = "/stream?swarm_id=%s&resource_id=%s"%(swarm_id, resource_id)
    conn.putrequest("POST", sel)
    conn.putheader("x-bugswarmapikey", api_key)
    conn.putheader("transfer-encoding", "chunked")
    conn.putheader("connection", "keep-alive")
    conn.endheaders()
    #Sleep required to allow the swarm server time to respond with header
    time.sleep(1)
    #Send a blank http body to open the connection
    conn.send('2\r\n\n\n\r\n')
        

def signal_handler(signal, frame):
        global conn
        print "in signal"
        conn.close()        
        sys.exit(0)

class Producer:
    
    def __init__(self):
        signal.signal(signal.SIGINT, signal_handler)
	create_Connection()
      
    def copyToProcessingFolder(self):
        src = "InputFolder/"
        dst = "ProcessingFolder/"
        src_files = os.listdir(src)
        for file_name in src_files:
            srcPath = src + file_name
            dstPath = dst + file_name
            shutil.move(srcPath, dstPath)
        #print "Copied all the files from Input to Processing folder"
    
    def Processing(self):
        try:
            global conn, swarm_id
            #respo = conn.getresponse()
            #print respo.status
            src = "ProcessingFolder/"
            src_files = os.listdir(src)
            
            conn.send('2\r\n\n\n\r\n')
            
            #time.sleep(10)
            for file_name in src_files:
                conn.send('2\r\n\n\n\r\n')
                config = ConfigParser.ConfigParser()
                location=src+file_name
                config.read(location)
                tran_type=config.get("Details", "type")
                if(tran_type=='Cash'):
                    product_name = config.get("Details", "Product Name")
                    product_price = config.get("Details", "Product Price")
                    resource = config.get("Details", "resource id")
                    #amount_recv = config.get("Details", "Amount Received")
                    #balance_amount = config.get("Details", "balance amount")
                    tran_Time = config.get("Details", "Time")
                    #msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Type": "Cash","Resource_ID" : "' + resource_id + '","Product_Name":"' + product_name + '","Product_Price":"' + product_price + '","Amount_Recevied":"' + amount_recv + '","Balanced_Amount":"' + balance_amount + '","Time":"' + time_1234 + '"}}}\r\n'
                    msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Resource_ID" : "' + resource + '","Swarm_ID":"' + swarm_id + '","Product_Name":"' + product_name + '","Sale_Amount":"' + product_price + '","Time":"' + tran_Time + '"}}}\r\n'
                    print msg
                elif(tran_type == 'Coupon'):
                    product_name = config.get("Details", "Product Name")
                    tran_Time = config.get("Details", "Time")
                    coupon_code =  config.get("Details", "Coupon Code")
                    resource = config.get("Details", "resource id")
                    #msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Type": "Coupon","Resource_ID" : "' + resource_id + '","Product_Name":"' + product_name + '","Coupon_Code":"' + coupon_code + '","Time":"' + time_1234 + '"}}}\r\n'
                    msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Resource_ID" : "' + resource + '","Swarm_ID":"' + swarm_id + '","Product_Name":"' + product_name + '","Coupon_Code":"' + coupon_code + '","Time":"' + tran_Time + '"}}}\r\n'
                    print msg
                elif(tran_type == 'Alert' ):
                    resource_id = config.get("Details", "Resource_ID")
                    swarm_id = config.get("Details", "Swarm_ID")
                    status = config.get("Details", "Status")
                    errorType = config.get("Details", "Error_Type")
                    msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Resource_ID" : "' + resource_id + '","Swarm_ID":"' + swarm_id + '","Status":"' + status + '","Error_Type":"' + errorType + '"}}}\r\n'
                    print msg
                elif(tran_type == 'StockReplishment'):
                    resource_id = config.get("Details", "Resource_ID")
                    swarm_id = config.get("Details", "Swarm_ID")
                    productName = config.get("Details", "Product_Name")
                    maxStock = config.get("Details", "Units_Replenished")
                    msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Resource_ID" : "' + resource_id + '","Swarm_ID":"' + swarm_id + '","Product_Name":"' + productName + '","Units_Replenished":"' + maxStock + '"}}}\r\n'
                    print msg
            
                size = hex(len(msg))[2:] + "\r\n"
                chunk = msg + "\r\n"
                conn.send(size+chunk)
                print "send"
                os.rename(src+file_name, src+file_name+"_P")
                time.sleep(1)
                print "Processed"
            
        except:
            print "Some Error has Occured"
            while(True):
                try:
                    conn.send('2\r\n\n\n\r\n')
                    print "Connection valid"
                    break
                except:
                    try:
                        time.sleep(5)
                        create_Connection()
                        print "Connection Created"
                        break
                    except:
                        print "Still not able to connect"
            
    
    def copyToProcessedFolder(self):
        import shutil,os
        src = "ProcessingFolder/"
        dst = "ProcessedFolder/"
        src_files = os.listdir(src)
        for file_name in src_files:
            if "_P" in file_name:
                print "in if"
                srcPath = src + file_name
                dstPath = dst + file_name
                shutil.move(srcPath, dstPath)
            else:
                print "Not Processed"
        #print "Copied all the files from Processing folder to Processed folder"
    
    
    def mainFunction(self):
        #obj = Producer()
        global obj
        while(True):
            obj.copyToProcessingFolder()
            obj.Processing()
            obj.copyToProcessedFolder()
            #time.sleep(1)


obj = Producer()
obj.mainFunction()
        

        
