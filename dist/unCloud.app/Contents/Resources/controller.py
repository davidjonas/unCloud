#!/usr/bin/python
from subprocess import *
import time
import re

finished = False
co = open("controller", "w")
co.write("started\n")
co.close()

contentPath = "/Library/WebServer/Documents/unCloudServer" #If this changes, please change also in redirect.py line 11

ci = open("controller", "r")

while not finished:
    command = ci.readline()
    #print "read command %s"%command
    if command == "redirect\n":
        Popen("./redirect.py", shell=True)
    elif command == "clean\n":
        Popen("./clean.py", shell=True)
    elif command == "close\n":
        finished = True
        call("> controller", shell=True)
    elif re.match("imagedir .*\n", command) is not None:
        dir = command[9:-1]
        print "removing %s/images"%contentPath
        call('rm -r "%s/images"'%contentPath, shell=True)
        call('mkdir "%s/images"'%contentPath, shell=True)
        call('cp -r "%s"/* %s/images/'%(dir, contentPath), shell=True)
    else:
        time.sleep(1)