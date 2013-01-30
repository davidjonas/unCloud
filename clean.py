#!/usr/bin/python
import sys
import os
from subprocess import *

pathname = os.path.dirname(sys.argv[0])
path = os.path.abspath(pathname)

print("Killing dnsmasq")
call(["%(path)s/pkill dnsmasq"%{"path":path}], shell=True)
print("killing maradns")
call(["%(path)s/pkill maradns"%{"path":path}], shell=True)
print("Reverting to DHCP Setting")
call(["ipconfig set en0 DHCP"], shell=True)
#Hard kill the apache process to make sure it's really gone
call(["./pkill httpd"],shell=True)
#Restart Apache
call(["apachectl start"], shell=True)

sys.exit(0)