<?php
header('Content-type: application/json');

$images_dir_name = "images/";

if ( isset($_REQUEST['file']) )
{
	$rev = strrev($_REQUEST['file']);
	$ext = substr($rev, 0, 4);
	
	if (strtolower(strrev($ext)) == ".jpg" || strtolower(strrev($ext)) == ".gif" || strtolower(strrev($ext)) == ".png")
	{
		echo('{"title": "", "description":"", "type": "Image", "media": {"url": "'.$images_dir_name.$_REQUEST['file'].'", "type": "Image"}}');
	}
	elseif (strtolower(strrev($ext)) == ".mp4")
	{
		echo('{"title": "", "description":"", "type": "Video", "media": {"url": "'.$images_dir_name.$_REQUEST['file'].'", "type": "Video"}}');
	}
}
else
{
	$images_dir = opendir( $images_dir_name );
	$json = "[";
	while (false !== ($entry = readdir($images_dir)))
	{
		$rev = strrev($entry);
		$ext = substr($rev, 0, 4);
		if ( ($entry !== "." && $entry !== "..") && (strtolower(strrev($ext)) == ".jpg" || strtolower(strrev($ext)) == ".gif" || strtolower(strrev($ext)) == ".png" || strtolower(strrev($ext)) == ".bmp" || strtolower(strrev($ext)) == ".mp4") )
		{
			$json .= '{"url" : "load.php?file='.$entry.'", "UID" : "'.$entry.'"},';
		}
	}
	$json[strlen($json)-1] = "]";
	
	echo $json;
}

?>