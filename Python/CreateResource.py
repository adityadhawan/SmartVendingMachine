from lib import swarmtoolscore
import shutil,os
import ConfigParser
import httplib
import base64
import json
import time
import subprocess
import shlex
from ConfigParser import SafeConfigParser
from random import randint

city =""
locality = ""
address =""
hostname = ""
keys = ""
swarm_id =""
latitude = 0
longitude = 0
latlng = ""
cf = ConfigParser.ConfigParser()
cfResource = SafeConfigParser()
cfStock = ConfigParser.ConfigParser()
cfStatus = ConfigParser.ConfigParser()

class CreateResource:
    '''
    Creating Resource at Runtime
    '''
    
    def __init__(self):
        global hostname, keys, swarm_id
        cf.read("config.cfg")  
        swarm_id = cf.get("Swarm", "swarm_id")
        hostname = swarmtoolscore.get_server_info()
        keys = swarmtoolscore.get_keys()
        
        if not keys["configuration"]:
            print "configuration key not present"
            self.getKeys()
            print "got from server"
        if not keys["participation"]:
            print "participation key not present"
            self.getKeys()
            print "got from server"
            
        
        
    def getKeys(self):
        cf.read("config.cfg")  
        hostname = cf.get("Server Information", "hostname")  
        user_id = cf.get("User Information", "user_id")
        password = cf.get("User Information", "password")
        conn = httplib.HTTPConnection(hostname)
        auth_hash = user_id + ":" + password
        auth_header = "Basic " + base64.b64encode(auth_hash)
        conn.request("GET", "/keys", None, {"Authorization":auth_header})
        resp = conn.getresponse()
        txt = resp.read()
        json_obj = json.loads(txt)
        for key_obj in json_obj:
            key_type = key_obj["type"]
            key_value = key_obj["key"]
            cf.set("Keys", key_type, key_value)
        with open("config.cfg", "wb") as configfile:
            cf.write(configfile)
            
    def getName(self):
        api_key=keys["configuration"]
        location = obj.getLocation()
        machine_no=""
        conn = httplib.HTTPConnection(hostname["hostname"])
        conn.request("GET", "/resources", None, {"x-bugswarmapikey":api_key})
        resp = conn.getresponse()
        txt = resp.read()
        conn.close()
        json_obj = json.loads(txt)
        for key_obj in json_obj:
            resource_name = key_obj["name"]
            if location in resource_name:
                resource_name=resource_name.split("_")
                machine_no = resource_name[2][7:]
        if machine_no == "":
            new_resource_name=location+"_Machine1"
        else:
            new_machine_no=int(machine_no)+1
            new_resource_name=location+"_Machine%d"%(new_machine_no)
        return new_resource_name
    
    def getLocation(self):
        global latlng
        cf.read("latlng.cfg")
        randomLocation = randint(1,10)
        latlng = cf.get("latlng", str(randomLocation))  
        conn = httplib.HTTPConnection("maps.googleapis.com")
        conn.request("GET", "/maps/api/geocode/json?latlng="+latlng+"&sensor=false")
        resp = conn.getresponse()
        txt = resp.read()
        json_obj = json.loads(txt)
        global city , locality, address
        for key_obj in json_obj["results"][0]:
            if key_obj == "formatted_address":
                address = json_obj["results"][0][key_obj]
        for key_obj in json_obj["results"][0]["address_components"]:
            for key_obj1 in key_obj["types"]:
                if key_obj1 == "administrative_area_level_1":
                    city = key_obj["long_name"]
                if key_obj1 == "sublocality":
                    locality = key_obj["long_name"]
                elif key_obj1 == "locality":
                    locality = key_obj["long_name"]
        location = city+"_"+locality
        return location
    
    def addResourceToConfig(self,resource_id):
        cfResource.read("resources.cfg")
        new_ID = 0
        for res_id,res_value in cfResource.items("Resources"):
            new_ID = int(res_id)
            #print new_ID
        cfResource.set("Resources", str(new_ID+1),resource_id)
        f = open('resources.cfg', 'w')
        cfResource.write(f)
        f.close()
        
        cfStock.read("stock.cfg")
        cfStock.add_section(resource_id)
        cf.read("config.cfg")
        for pro_id,pro_value in cf.items("Products"):
            cfStock.set(resource_id, str(pro_id), "0")
        cfStock.set(resource_id, "InputFolder", resource_id+"/Input/")
        cfStock.set(resource_id, "ProcessingFolder", resource_id+"/Processing/")
        cfStock.set(resource_id, "ProcessedFolder", resource_id+"/Processed/")
        f = open('stock.cfg', 'w')
        cfStock.write(f)
        f.close()
        os.makedirs(resource_id+"/")
        os.makedirs(resource_id+"/Input/")
        os.makedirs(resource_id+"/Processing/")
        os.makedirs(resource_id+"/Processed/")
        cfStatus.read("status.cfg")
        cfStatus.set("Status", resource_id, "1")
        f = open('status.cfg', 'w')
        cfStatus.write(f)
        f.close()
        
    def addResourceToSwarm(self,resource_id):
        resource_type = "producer"
        add_resource = {"resource_id": resource_id, "resource_type": resource_type}
        add_resource_json = json.dumps(add_resource)
        conn = httplib.HTTPConnection(hostname["hostname"])
        conn.request("POST", "/swarms/%s/resources"%(swarm_id), add_resource_json, {"x-bugswarmapikey":keys["configuration"]})
        resp = conn.getresponse()
        txt = resp.read()
        conn.close()
        if txt != "Created":
            print json.dumps(json.loads(txt), sort_keys=True, indent=4)
        else:
            print "Resource Added to Swarm"
        
    def sendPresenceMessageToSwarm(self,resource_id): 
        api_key=keys["participation"]
        conn = httplib.HTTPConnection(hostname["hostname"])
        sel = "/stream?swarm_id=%s&resource_id=%s"%(swarm_id, resource_id)
        conn.putrequest("POST", sel)
        conn.putheader("x-bugswarmapikey", api_key)
        conn.putheader("transfer-encoding", "chunked")
        conn.putheader("connection", "keep-alive")
        conn.endheaders()
        time.sleep(1)
        conn.send('2\r\n\n\n\r\n')
        time.sleep(5)
        
    
    def dynamicResourceCreation(self):
        global obj
        name = obj.getName()
        description = address
        global latitude,longitude,latlng
        #Creating New Resource Start
        latlngArray = latlng.split(",")
        latitude = latlngArray[0]
        longitude = latlngArray[1]
        create_resource = {"name": name, "machine_type": "bug"}
        create_resource["description"] = description
        latlon = {"latitude": float(latitude), "longitude": float(longitude)}
        create_resource["position"] = latlon
        create_resource_json = json.dumps(create_resource)
        conn = httplib.HTTPConnection(hostname["hostname"])
        conn.request("POST", "/resources", create_resource_json, {"x-bugswarmapikey":keys["configuration"]})
        resp = conn.getresponse()
        txt = resp.read()
        conn.close()
        #Creating New Resource End
        
        print json.dumps(json.loads(txt), sort_keys=True, indent=4)
        json_obj = json.loads(txt)
        resource_id=json_obj["id"]
        
        #Adding Resource Id to config file 
        obj.addResourceToConfig(resource_id)
        
        #Adding Resource Id to swarm 
        obj.addResourceToSwarm(resource_id)
        
        #Sending Presence message to consumer over swarm start
        obj.sendPresenceMessageToSwarm(resource_id)
        
        #global city , locality
        #latitude = cf.get("latlang", "latitude")
        #longitude = cf.get("latlang", "longitude")
        #msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Type": "NewVendingMachine","Resource_ID" : "' + resource_id + '","Swarm_ID":"' + swarm_id + '","Latitude":"' + latitude + '","Longitude":"' + longitude + '","VendingMachineName":"' + name + '","Region":"' + city + '","Location":"' + locality + '"}}}\r\n'
        #size = hex(len(msg))[2:] + "\r\n"
        #chunk = msg + "\r\n"
        #conn.send(size+chunk)
        #print "send"
        #time.sleep(10)
        
obj = CreateResource()
obj.dynamicResourceCreation()
