#!/usr/bin/python
import sys
import os
from subprocess import *
import time
import socket
import webbrowser

pathname = os.path.dirname(sys.argv[0])
path = os.path.abspath(pathname)
contentPath = "/Library/WebServer/Documents/unCloudServer"

#Check if content path already exists and has the right version
if not os.path.exists(contentPath):
        print "Copying content"
        os.mkdir(contentPath)
        #Copy content to /Library/WebServer/Documents/unCloudServer
        call(["cp -r %s/content/ %s"%(path, contentPath)], shell=True)
        time.sleep(2)
        call(["chmod -R 777 %s"%contentPath], shell=True)
else:
    print "Content exists, checking version"
    if os.path.exists("%s/version.txt"%contentPath):
        systemVersionFile = open("%s/version.txt"%contentPath, "r")
        installVersionFile = open("%s/content/version.txt"%path, "r")
        if systemVersionFile.read() != installVersionFile.read():
            print "Copying content, versions did not match."
            call("rm -r %s"%contentPath, shell=True)
            os.mkdir(contentPath)
            #Copy content to /Library/WebServer/Documents/unCloudServer
            call(["cp -r %s/content/ %s"%(path, contentPath)], shell=True)
            time.sleep(2)
            call(["chmod -R 777 %s"%contentPath], shell=True)
        else:
            print "versions match."
    else:
        print "Copying content, no version file found. Deleting %s"%contentPath
        call("rm -r %s"%contentPath, shell=True)
        os.mkdir(contentPath)
        #Copy content to /Library/WebServer/Documents/unCloudServer
        call(["cp -r %s/content/ %s"%(path, contentPath)], shell=True)
        time.sleep(2)
        call(["chmod -R 777 %s"%contentPath], shell=True)

    
    
if not os.path.exists("/private/etc/php.ini"):
    call("cp /private/etc/php.ini.default /private/etc/php.ini", shell=True)
    
ip = "192.168.1.1"

maracConfig = """hide_disclaimer = "YES"
csv2 = {}
csv2["."] = "csv2_default_zonefile"
ipv4_bind_addresses = "%(ip)s"
chroot_dir = "%(path)s/maradns"
"""%{"path":path, "ip":ip}

zoneConfig = """*.	SOA	intk.com. email@intk.com. 1 7200 3600 604800 1800
*.	NS	ns.intk.com.
*.	A	%s
"""%ip

#Write marac file
marac = open("%s/maradns/mararc"%path, "w")
marac.write(maracConfig)
marac.close()

#Write zonefile
zone = open("%s/maradns/csv2_default_zonefile"%path, "w")
zone.write(zoneConfig)
zone.close()

#Generate the config file from the template
apacheConfigTemplate = open("%s/unCloudTemplate.conf"%path, "r")
configText = apacheConfigTemplate.read().replace("UNCLOUDPATH", contentPath)
apacheConfigTemplate.close()
apacheConfig = open("%s/unCloudServer.conf"%path, "w")
apacheConfig.write(configText)
apacheConfig.close()

print("Setting up address %s"%ip)
call(["ipconfig set en1 INFORM %s"%ip], shell=True)
#Give some time for the ip to settle
time.sleep(2)

#Stop Apache
call(["apachectl stop"], shell=True)
#Hard kill the apache process to make sure it's really gone
call(["./pkill httpd"],shell=True)
#give some time for the apache to end
time.sleep(2)
#Start Apache with our config file
call(["apachectl -f %s/unCloudServer.conf"%path], shell=True)

print("Starting DNSMasq")
call(["%(path)s/dnsmasq/dnsmasq -C %(path)s/dnsmasq/dnsmasq.conf -p 54"%{"path":path}], shell=True)
print("Starting maraDNS")
call(["%(path)s/maradns/maradns -f %(path)s/maradns/mararc &"%{"path":path}], shell=True)

sys.exit(0)
