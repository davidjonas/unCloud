#!/usr/bin/python
import sys
import os
from subprocess import *
import time
import socket
import webbrowser
import thread
import urllib2
from threading import *

def rgb2hex(r,g,b):
    return '#%02X%02X%02X'%(r,g,b)

major, _, _, _, _ = sys.version_info
if major != 3:
    from Tkinter import *
else:
    from tkinter import *

import tkFileDialog  
 
class NetworkChecker(Thread):
    def __init__(self, app):
        Thread.__init__(self)
        self.app = app
        self.daemon = True
        self.kill = False

    def isAdHocMode(self):
        try:
            airportcmd = Popen("""/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | grep "op mode" """, stdin=PIPE, stdout=PIPE, shell=True)
            out = airportcmd.stdout.read()
            if out.index("IBSS") != -1:
                return True
            else:
                return False
        except:
            return False
        
    def run(self):
        while not self.isAdHocMode():
            if self.kill:
                break
            time.sleep(0.3)
        
        if self.isAdHocMode():
            app.ready()
        
 
class Application(Frame):
    def Controller(self):
        if self.controller is None:
            call("> controller", shell=True)
            self.controller = Popen("""osascript -e 'do shell script "./controller.py"  with administrator privileges'""", stdin=PIPE, stdout=PIPE, shell=True)
            while 1:
                controllerCheck  = open("controller", "r")
                line = controllerCheck.readline()
                if line.find("started") != -1:
                    break
                else:
                    time.sleep(1)
                controllerCheck.close()
        if self.controllerInput is None:
            self.controllerInput = open("controller", "w")
            self.controllerInput.write("started\n")
            self.controllerInput.flush()
        return self.controllerInput
    
    def sendCommand(self, cmd):
        ci = self.Controller()
        print("sending command %s"%cmd)
        ci.write("%s\n"%cmd)
        ci.flush()
        if cmd == "close":
            ci.close()
        
    def redirect(self, event=None):
        #self.deactivateAll()
        if self.cloudStatus == False:
            self.sendCommand("redirect")
            self.cloudStatus = True    
    
    def waitForApache(self, event=None):
        #time.sleep(5)
        tries = 0
        while tries < 20: 
            try:
                #localhost = urllib2.urlopen("http://localhost")
                localhostLoad = urllib2.urlopen("http://localhost/load.php")
            except urllib2.URLError, e:
                time.sleep(1)
                tries = tries+1
            else:
                time.sleep(2)
                return True
        return False

    
    def cloudStart(self, event=None):
        self.activateDone()
        self.TUT.place_forget()
        self.BALOON.place_forget()
        self.LOADER.place_forget()
        if self.controller is None:
            self.PASSINFO.place(x=176, y=100)
            self.update()
            time.sleep(1)
        self.redirect()
        if self.importFolder is not None:
            self.sendCommand("imagedir %s"%self.importFolder)
            self.importFolder = None
        self.apacheSuccess = self.waitForApache()
        print("Opening browser")
        webbrowser.open("http://localhost")
        self.STARTBG.pack_forget()
        self.START.place_forget()
        self.TUTBG.pack_forget()
        self.TUT.place_forget()
        self.LOADER.place_forget()
        self.PASSINFO.place_forget()
        self.RESTORE.place_forget()
        self.STOPBG.pack()
        self.STOP.place(x=550, y=259)
        if not self.apacheSuccess:
            self.REFRESH.place(x=470 , y=10)
        self.update()
        self.deactivateAll()
    
    def cleanCommand(self, event=None):
        if self.cloudStatus == True:
            self.sendCommand("clean")
            self.cloudStatus = False
            self.networkReady = False
            self.stopNetworkChecker()
    
    def clean(self, event=None):
        try:
            self.activateStop()
        except:
            pass
        
        if self.cloudStatus == True:
            self.cleanCommand()
            try:
                self.STOPBG.pack_forget()
                self.STOP.place_forget()
                self.TUTBG.pack_forget()
                self.TUT.place_forget()
                if not self.apacheSuccess:
                    self.REFRESH.place_forget()
                self.FOLDER.place_forget()
                self.STARTBG.pack()
                self.START.place(x=620, y=259)
                self.FOLDER.place(x=466, y=259)
                self.RESTORE.place(x=454, y=22)
                self.update()
            except:
                pass
            
        try:
            self.deactivateAll()
        except:
            pass
    
    def startNetworkChecker(self, event=None):
        self.stopNetworkChecker()
        self.networkChecker = NetworkChecker(self)
        self.networkChecker.start()
      
    def stopNetworkChecker(self, event=None):
        if self.networkChecker is not None and self.networkChecker.isAlive():
            self.networkChecker.kill = True
    
    def ready(self, event=None):
        self.networkReady = True
    
    def cleanAndQuit(self, event=None):
        print("cleanup!!")
        self.cleanCommand()
        time.sleep(1)
        self.quit()
 
    def activateStart(self, event=None):
        self.START["image"] = self.fakeStartActive
        self.update()
    
    def activateStop(self, event=None):
        self.STOP["image"] = self.fakeStopActive
        self.update()
        
    def activateFolder(self, event=None):
        self.FOLDER["image"] = self.fakeFolderActive
        self.update()
    
    def activateDone(self, event=None):
        self.TUT["image"] = self.fakeDoneActive
        self.update()
    
    def deactivateAll(self):
        self.START["image"] = self.fakeStartNormal
        self.STOP["image"] = self.fakeStopNormal
        self.FOLDER["image"] = self.fakeFolderNormal
        if self.networkReady:
            self.TUT["image"] = self.fakeDoneNormal
        else:
            self.TUT["image"] = self.fakeDoneNormal
            
    def waitingMode(self, event=None):
        self.TUT.place_forget()
        self.BALOON.place_forget()
        self.LOADER.place(x=500,y=240)
        #TODO: Add the loader to the window
        self.update()
        
        counter = 0
        l = 0
        
        while counter < 6:
            if self.networkReady:
                break
            else:
                counter = counter + 1
                #Animate the loader
                if l == 0:
                    self.LOADER["image"] = self.loader
                    l = 1
                elif l == 1:
                    self.LOADER["image"] = self.loader2
                    l = 2
                elif l == 2:
                    self.LOADER["image"] = self.loader3
                    l = 0
                self.update()
                time.sleep(1)
        
        if self.networkReady:
            self.cloudStart()
        else:
            self.TUT.place(x=550, y=259)
            self.BALOON.place(x=365, y=0)
            self.LOADER.place_forget()
            self.update()
        
        
    def showTut(self, event=None):
        self.activateStart()
        self.startNetworkChecker()
        self.STARTBG.pack_forget()
        self.START.place_forget()
        self.FOLDER.place_forget()
        self.STOPBG.pack_forget()
        self.RESTORE.place_forget()
        self.STOP.place_forget()
        self.TUTBG.pack()
        self.TUT.place(x=550, y=259)
        self.update()
        self.deactivateAll()
 
    def updateImagesFolder(self, event=None):
        self.activateFolder()
        directory = tkFileDialog.askdirectory(mustexist=True)
        
        if directory != "":
            #self.sendCommand("imagedir %s"%directory)
            #print("Opening browser")
            #webbrowser.open("http://localhost")
            self.importFolder = directory
            self.showTut()
            
        self.deactivateAll()
        
 
    def createWidgets(self):
        winGray = rgb2hex(204,204,204)
        
        self.menubar = Menu(self.master)
        menu = Menu(self.menubar, name='apple', tearoff=0)
        self.menubar.add_cascade(menu=menu)
        #self.menubar.add_cascade(label="unCloud", menu=menu)
        #print(dir(self.menubar))
        menu.add_command(label="Start", command=self.redirect)
        menu.add_command(label="Stop", command=self.clean)
        
        self.master.config(menu=self.menubar)
        
        self.photo1 = PhotoImage(file="uncloud_start.gif")
        self.photo2 = PhotoImage(file="uncloud_stop.gif")
        self.photo3 = PhotoImage(file="uncloud_tut.gif")
        self.fakeStartNormal = PhotoImage(file="start_normal.gif")
        self.fakeStartActive = PhotoImage(file="start_active.gif")
        self.fakeStopNormal = PhotoImage(file="stop_normal.gif")
        self.fakeStopActive = PhotoImage(file="stop_active.gif")
        self.fakeDoneNormal = PhotoImage(file="done_normal.gif")
        self.fakeDoneActive = PhotoImage(file="done_active.gif")
        self.fakeDoneInactive = PhotoImage(file="done_inactive.gif")
        self.baloonImage = PhotoImage(file="uncloud_baloon.gif")
        self.loader = PhotoImage(file="loader.gif")
        self.loader2 = PhotoImage(file="loader2.gif")
        self.loader3 = PhotoImage(file="loader3.gif")
        self.passImage = PhotoImage(file="password_info.gif")
        self.restoreImage = PhotoImage(file="restore.gif")
        self.refreshImage = PhotoImage(file="refreshMessage.gif")
        self.folderImage = PhotoImage(file="folderSelect.gif")
        self.fakeFolderNormal = PhotoImage(file="folder_normal.gif")
        self.fakeFolderActive = PhotoImage(file="folder_active.gif")
        
        
        self.STARTBG = Label(self, width=854, height=480, image=self.photo1)
        self.STARTBG.pack()
        self.STOPBG = Label(self, width=854, height=480, image=self.photo2)
        self.TUTBG = Label(self, width=854, height=480, image=self.photo3)
        
        self.STOP = Label(self, width=100, height=26, borderwidth=0, image=self.fakeStopNormal)
        self.STOP.bind("<ButtonRelease-1>", self.clean)
        
        self.START = Label(self, width=130, height=26, borderwidth=0, image=self.fakeStartNormal)
        self.START.bind("<ButtonRelease-1>", self.showTut)
        self.START.place(x=620, y=259)
        
        self.FOLDER = Label(self, width=130, height=26, borderwidth=0, image=self.fakeFolderNormal)
        self.FOLDER.bind("<ButtonRelease-1>", self.updateImagesFolder)
        self.FOLDER.place(x=466, y=259)
        
        self.TUT = Label(self, width=100, height=26, borderwidth=0, image=self.fakeDoneNormal)
        self.TUT.bind("<ButtonRelease-1>", self.waitingMode)
        
        self.BALOON = Label(self, width=448, height=166, borderwidth=0, image=self.baloonImage)
        self.LOADER = Label(self, width=212, height=55, borderwidth=0, image=self.loader2)
        self.PASSINFO = Label(self, width=516, height=267, borderwidth=0, image=self.passImage)
        self.RESTORE = Label(self, width=369, height=129, borderwidth=0, image=self.restoreImage)
        self.REFRESH = Label(self, width=374, height=169, borderwidth=0, image=self.refreshImage)
        
        
        
    def __init__(self, master=None):
        Frame.__init__(self, master, width=854, height=480)
        self.cloudStatus = False
        self.controller = None
        self.networkReady = False
        self.networkChecker = None
        self.controllerInput = None
        self.browserSuccess = False
        self.importFolder = None
        self.pack(fill=BOTH, expand=YES)
        self.createWidgets()
        


def center_window(root, w=300, h=200):
    # get screen width and height
    ws = root.winfo_screenwidth()
    hs = root.winfo_screenheight()
    # calculate position x, y
    x = (ws/2) - (w/2)
    y = (hs/2) - (h/2)
    root.geometry('%dx%d+%d+%d' % (w, h, x, y))

root = Tk()
root.title("unCloud")
#root.geometry("854x480")
center_window(root, w=854, h=480)
root.resizable(width=FALSE, height=FALSE)
app = Application(master=root)
#root.createcommand('::tk::mac::Quit', app.cleanAndQuit)
root.createcommand('exit', app.cleanAndQuit)
root.focus_force()
app.mainloop()
app.clean()
if app.controller is not None:
    app.sendCommand("close")
try:
    if app.controller is not None:
        app.controller.terminate()
    root.destroy()
except:
    pass

    