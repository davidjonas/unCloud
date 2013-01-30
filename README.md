unCloud
=======

The internet has become an increasingly disputed space. Governments want to regulate it and internet providers want to restrict access to parts of it. To help us remember that the internet can exist without governments, we have created unCloud. unCloud is an application that enables anyone with a laptop to create an open wireless network and distribute their own information. Once it is launched, a passerby using a mobile internet device can connect to this open wireless network. The person running the application can decide what information is shown in any web address. Users can access information wirelessly while at the same time remain disconnected from the internet. unCloud does not depend on a remote datacenter, instead it can be run from a laptop, making it an ideal application to run in a train or at a café.

Installation instructions
=========================

To install unCloud on linux you can use the automatic remote installation script by simply pasting the following command on a terminal window.

curl https://raw.github.com/davidjonas/unCloud/unCloudLinux/remote-install | sudo sh


This configures your machine downloads and installs unCloud at ~/unCloud


Running unCloud
===============

To run unCloud, type the following commands in a terminal:


cd ~/unCloud

sudo ./start


When you are done using unCloud you can stop it by running:

sudo ./stop


Distributions
=============

This version was tested only in Ubuntu. Should be possible to run on other distributions though.
