import subprocess
import os
import SocketServer
import time
import StockReplishment
import socket
import SimpleHTTPServer
import shlex

process_id = 0
process_obj = ''
dispense_process_obj = ''
dispense_process_id = 0
alert_process_obj = ''
alert_process_id = 0

class MyRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    
    def do_GET(self):
        print "in get" 
        if self.path == '/':
	     self.path = '/Welcome.html'
	     return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

        #if self.path == '/CreateResources':
         #   self.path = '/CreateResources.html'
          #  return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
        #elif self.path == '/StockReplishment':
         #   self.path = '/StockReplishment.html'
          #  return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
        #elif self.path ==  '/Dispensing':
         #   print self.path
          #  self.path = '/Dispensing.html'
           # return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
        #elif self.path ==  '/Alert':
         #   print self.path
          #  self.path = '/Alert.html'
          #  return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
        #elif self.request.recv(8192) != ' ':
        #   print self.path 
        #   print "in request"
        #   return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)


    def do_POST(self):
        global process_id, process_obj, dispense_process_obj, dispense_process_id, alert_process_obj, alert_process_id 
        print "in post"
        print "Client requested:", self.command, self.path
	data = self.path
        print data
        scriptType = data.split("?")
        print scriptType[1]
        if(scriptType[1]=="create"):
            print "in create"
            print scriptType[2]
            #self.request.send("Vending Machines Creation Started")
            #time.sleep(5)
            for i in range(0,int(scriptType[2])):
                process_obj = subprocess.Popen(shlex.split('nohup sh CreateResource.sh &'))
                process_id = process_obj.pid
                time.sleep(5)
            self.request.send("Vending Machines Created")
        elif(scriptType[1]=="update"):
            print scriptType[2]
            if(scriptType[2] == ""):
                StockReplishment.updateAll()
                print "Updated"
                self.request.send("Stock Replishment Completed")
            else:
                resource_ids = scriptType[2].split(",")
                StockReplishment.updateSelected(resource_ids)
                print "Updated"
        elif(scriptType[1]=="startDispensing"):
            print("in 1")
            if(dispense_process_id == 0):
                dispense_process_obj = subprocess.Popen(shlex.split('python EmulateMachine.py'))
                dispense_process_id = dispense_process_obj.pid
                print dispense_process_obj.pid
                self.request.send("Dispensing Started")
            else:
                print "Already Running"
                self.request.send("Dispensing Already Running")
        elif(scriptType[1]=="stopDispensing"):
            os.system("kill -9 "+str(dispense_process_id))
            dispense_process_id = 0
            self.request.send("Dispensing Stopped")
        elif(scriptType[1]=="startAlert"):
            if(alert_process_id == 0):
                alert_process_obj = subprocess.Popen(shlex.split('python Alert.py'))
                alert_process_id = alert_process_obj.pid
                print alert_process_obj.pid
                self.request.send("Fault Generation Started")
            else:
                print "Already Running"
                self.request.send("Fault Generation Already Running")
        elif(scriptType[1]=="stopAlert"):
            os.system("kill -9 "+str(alert_process_id))
            alert_process_id = 0
            print "stopped"
            self.request.send("Fault Generation Stopped")
        else:
            print "in else"
            
if __name__ == "__main__":
    Handler = MyRequestHandler
    HOST, PORT = "100.67.2.42" , 5999
    SocketServer.BaseServer.allow_reuse_address = True
    server = SocketServer.TCPServer((HOST, PORT), Handler)
    server.serve_forever()
