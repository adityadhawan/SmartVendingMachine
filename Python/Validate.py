import json
import httplib
from lib import swarmtoolscore
import ConfigParser
cf = ConfigParser.ConfigParser()

def validateCoupon(couponCode,resource_id):
        #print "in validate Coupon"
        #hostname = swarmtoolscore.get_server_info()
        #keys = swarmtoolscore.get_keys()
        #cf.read("config.cfg")  
        #resource_id=cf.get("Swarm", "resource_id")
        #swarm_id = cf.get("Swarm", "swarm_id")
        #api_key=keys["participation"]
        #sel = "/stream?swarm_id=%s&resource_id=%s"%(swarm_id, resource_id)
        #conn.putrequest("POST", sel)
        #conn.putheader("x-bugswarmapikey", api_key)
        #conn.putheader("transfer-encoding", "chunked")
        #conn.putheader("connection", "keep-alive")
        #conn.endheaders()
        #msg = '{"message": {"to": ["' + swarm_id + '"], "payload":{ "Resource_ID" : "' + resource_id + '","Swarm_ID":"' + swarm_id + '","Coupon_Code":"' + couponCode + '"}}}\r\n'
        #size = hex(len(msg))[2:] + "\r\n"
        #chunk = msg + "\r\n"
        #conn.send(size+chunk)
        
        conn = httplib.HTTPConnection("m2mdemo.cloudapp.net:5001")
        conn.request("GET", "/isCouponValid/"+couponCode)
        resp = conn.getresponse()
        txt = resp.read()
        #print txt
        #txt = '{"CouponStatus": []}'
        ##txt = '{"CouponStatus": [{"_id": "531d6f78bbe06d88ce151729","code": "0126","genratedon": "2014-02-27T18:30:00.000Z","item": "Diet Coke","resource_id": [],"transaction_id": []}]}'
        json_obj = json.loads(txt)
        #time.sleep(10)
        return json_obj
        
    
