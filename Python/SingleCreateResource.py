'''
Created on Jan 26, 2014

@author: Aditya
'''
from lib import swarmtoolscore
import ConfigParser
import httplib
import base64
import json
import time
import os

city =""
locality = ""
address =""
hostname = ""
keys = ""
swarm_id =""
resource =""
latitude = 0
longitude = 0
cf = ConfigParser.ConfigParser()

class CreateResource:
    '''
    Creating Resource at Runtime
    '''

    
    def __init__(self):
        print "in init"
        global hostname, keys, swarm_id, resource
        cf.read("config.cfg")  
        swarm_id = cf.get("Swarm", "swarm_id")
        resource = cf.get("Swarm", "resource_id")
        hostname = swarmtoolscore.get_server_info()
        keys = swarmtoolscore.get_keys()
        
        if not keys["configuration"]:
            print "configuration key not present"
            obj.getKeys()
            print "got from server"
        if not keys["participation"]:
            print "participation key not present"
            obj.getKeys()
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
        global latitude,longitude
        cf.read("config.cfg")  
        latitude = cf.get("latlang", "latitude")
        longitude = cf.get("latlang", "longitude")
        conn = httplib.HTTPConnection("maps.googleapis.com")
        conn.request("GET", "/maps/api/geocode/json?latlng="+latitude+","+longitude+"&sensor=false")
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
                if key_obj1 == "locality":
                    locality = key_obj["long_name"]
                elif key_obj1 == "sublocality":
                    locality = key_obj["long_name"]
        location = city+"_"+locality
        return location
    
    def addResourceToConfig(self,resource_id):
        self.createDir()
        cf.read("config.cfg")
        cf.set("Swarm", "resource_id",resource_id)
	cf.set("Products", "101", "Diet Coke")
	cf.set("Products", "102", "Coke")
	cf.set("Products", "103", "Dairy Milk")
	cf.set("Products", "104", "Five Star")
	cf.set("Products", "105", "Lays")
	cf.set("Products", "106", "Bingo")
	cf.set("Products_Price" , "101", "1")
	cf.set("Products_Price" , "102", "1.5")
	cf.set("Products_Price" , "103", "4")
	cf.set("Products_Price" , "104", "2")
	cf.set("Products_Price" , "105", "3")
	cf.set("Products_Price" , "106", "2.5")
	cf.set("Product_Stock" , "101", "0")
	cf.set("Product_Stock" , "102", "0")
	cf.set("Product_Stock" , "103", "0")
	cf.set("Product_Stock" , "104", "0")
	cf.set("Product_Stock" , "105", "0")
	cf.set("Product_Stock" , "106", "0")
        f = open('config.cfg', 'w')
        cf.write(f)
        f.close()
    

    def createDir(self):
        if not os.path.exists("InputFolder"):
            os.makedirs("InputFolder")
        if not os.path.exists("ProcessingFolder"):
            os.makedirs("ProcessingFolder")
        if not os.path.exists("ProcessedFolder"):
            os.makedirs("ProcessedFolder")
        print "Directories Created Successfully"
    
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
        global obj,latitude,longitude,resource
        if(resource == ""):
            name = obj.getName()
            description = address 

            #Creating New Resource Start
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
           
            #Adding Resource Id to swarm 
            obj.addResourceToSwarm(resource_id)
        
            #Adding Resource Id to config file 
            obj.addResourceToConfig(resource_id)
        
            #Sending Presence message to consumer over swarm start
            obj.sendPresenceMessageToSwarm(resource_id)
        else:
            print "Vending Machine Already Registered"
        
obj = CreateResource()
obj.dynamicResourceCreation()
