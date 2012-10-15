/****************************************************************
 * Most Simple Ajax Chat Script (www.linuxuser.at)		*
 * Version: 3.1							*
 * 								*
 * Author: Chris (chris[at]linuxuser.at)			*
 * Contributors: Derek, BlueScreenJunky (http://forums.linuxuser.at/viewtopic.php?f=6&t=17)
 *								*
 * Licence: GPLv2						*
 ****************************************************************/

/* Settings you might want to define */
var waittime=800;
var xmlhttp = false;
var xmlhttp2 = false;

/* Request for Reading the Chat Content */
function ajax_read(url) {
        if(window.XMLHttpRequest){
                xmlhttp=new XMLHttpRequest();
                if(xmlhttp.overrideMimeType){
                        xmlhttp.overrideMimeType('text/xml');
                }
        } else if(window.ActiveXObject){
                try{
                        xmlhttp=new ActiveXObject("Msxml2.XMLHTTP");
                } catch(e) {
                        try{
                                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                        } catch(e){
                        }
                }
        }

        if(!xmlhttp) {
                alert('Giving up :( Cannot create an XMLHTTP instance');
                return false;
        }

        xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState==4) {
                document.getElementById("chatwindow").innerHTML = xmlhttp.responseText;

                zeit = new Date(); 
                ms = (zeit.getHours() * 24 * 60 * 1000) + (zeit.getMinutes() * 60 * 1000) + (zeit.getSeconds() * 1000) + zeit.getMilliseconds(); 
                intUpdate = setTimeout("ajax_read('chat.txt?x=" + ms + "')", waittime)
                }
        }

        xmlhttp.open('GET',url,true);
        xmlhttp.send(null);
}

/* Request for Writing the Message */
function ajax_write(url){
        if(window.XMLHttpRequest){
                xmlhttp2=new XMLHttpRequest();
                if(xmlhttp2.overrideMimeType){
                        xmlhttp2.overrideMimeType('text/xml');
                }
        } else if(window.ActiveXObject){
                try{
                        xmlhttp2=new ActiveXObject("Msxml2.XMLHTTP");
                } catch(e) {
                        try{
                                xmlhttp2=new ActiveXObject("Microsoft.XMLHTTP");
                        } catch(e){
                        }
                }
        }

        if(!xmlhttp2) {
                alert('Giving up :( Cannot create an XMLHTTP instance');
                return false;
        }

        xmlhttp2.open('GET',url,true);
        xmlhttp2.send(null);
}

/* Submit the Message */
function submit_msg(){
        nick = document.getElementById("chatnick").value;
        msg = document.getElementById("chatmsg").value;

        if (nick == "") { 
                check = prompt("Please enter your name:"); 
                if (check === null) return 0; 
                if (check == "") check = "anonymous"; 
                document.getElementById("chatnick").value = check;
                nick = check;
        } 

        document.getElementById("chatmsg").value = "";
        ajax_write("w.php?m=" + msg + "&n=" + nick);
}

/* Check if Enter is pressed */
function keyup(arg1) { 
        if (arg1 == 13) submit_msg(); 
}

$(function () {
    /* Internal Variables & Stuff */
    document.getElementById("chatmsg").focus()
    document.getElementById("chatwindow").innerHTML = "loading...";
    

    
    
    ajax_write("w.php?m=Someone just joined this local cloud.&n=unCloud");
    document.getElementById("chatnick").value = "Anonymous";
    
    /* Start the Requests! ;) */
    var intUpdate = setTimeout("ajax_read('chat.txt')", waittime)
    });