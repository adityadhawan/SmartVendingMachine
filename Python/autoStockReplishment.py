import time
import ConfigParser
from time import strftime,gmtime

cf = ConfigParser.ConfigParser()
cfStock = ConfigParser.ConfigParser()
maxStock = 10

class autoStockReplishment():
    
    def getProduct(self,option):
        cf1 = ConfigParser.ConfigParser()
        cf1.read("config.cfg")  
        val=cf1.get("Products", option)  
        return val

    def updateAll(self):       
        global maxStock
        cf = ConfigParser.ConfigParser()
        cf.read("config.cfg") 
        swarm_id = cf.get("Swarm", "swarm_id")
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
                    productName = self.getProduct(name)
                    print productName
                    t= time.time()
                    #currentTime =  strftime("%Y-%m-%d %H:%M:%S", gmtime(t))
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
                
    def main(self):
        while(True):
            time.sleep(60*60*24)
            self.updateAll()

        
        
if __name__ == "__main__":
    obj = autoStockReplishment()
    obj.main()
