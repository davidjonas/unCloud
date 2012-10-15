<?php
	/* author: chris at linuxuser.at 
		licence: GPLv2 
	*/
	
	$fn = "chat.txt";
	$maxlines = 18;
	$nick_length = 9;

	/* Set this to a minimum wait time between posts (in sec) */
	$waittime_sec = 0;	
	
	/* spam keywords */
	$spam[] = "nigger";
	$spam[] = "cum";
	$spam[] = "dick";
	$spam[] = "EAT coon";

	/* IP's to block */
	$blockip[] = "72.60.167.89";

	/* spam, if message IS exactly that string */	
	$espam[] = "ajax";
	
	/* Get Message & Nick from the Request and Escape them */
	$msg = $_REQUEST["m"];
	$msg = htmlspecialchars(stripslashes($msg));

	$n = $_REQUEST["n"];
	$n = htmlspecialchars(stripslashes($n));

	if (strlen($n) >= $nick_length) { 
		$n = substr($n, 0, $nick_length); 
	} else { 
		for ($i=strlen($n); $i<$nick_length; $i++) $n .= "&nbsp;";
	}

	if ($waittime_sec > 0) {
		$lastvisit = $_COOKIE["lachatlv"];
		setcookie("lachatlv", time());
 
		if ($lastvisit != "") {
			$diff = time() - $lastvisit;
			if ($diff < 5) { die();	}
		} 
	}

	if ($msg != "")  {
		if (strlen($msg) < 2) { die(); }
		if (strlen($msg) > 3) { 
			/* Smilies are ok */
			if (strtoupper($msg) == $msg) { die(); }
		}
		if (strlen($msg) > 150) { die(); }
		if (strlen($msg) > 15) { 
			if (substr_count($msg, substr($msg, 6, 8)) > 1) { die(); }
		}

		foreach ($blockip as $a) {
			if ($_SERVER["REMOTE_ADDR"] == $a) { die(); }
		}
		
		$mystring = strtoupper($msg);
		foreach ($spam as $a) {	
			 if (strpos($mystring, strtoupper($a)) === false) {
			 	/* Everything Ok Here */
			 } else {
			 	die();
			 }
		}		

		foreach ($espam as $a) {
			if (strtoupper($msg) == strtoupper($a)) { die(); }		
		}
				
		$handle = fopen ($fn, 'r'); 
		$chattext = fread($handle, filesize($fn)); fclose($handle);
		
		$arr1 = explode("\n", $chattext);

		if (count($arr1) > $maxlines) {
			/* Pruning */
			$arr1 = array_reverse($arr1);
			for ($i=0; $i<$maxlines; $i++) { $arr2[$i] = $arr1[$i]; }
			$arr2 = array_reverse($arr2);			
		} else {
			$arr2 = $arr1;
		}
		
		$chattext = implode("\n", $arr2);

		if (substr_count($chattext, $msg) > 2) { die(); }
		 
		$out = $chattext . $n . "&nbsp;| " . $msg . "<br />\n";
		$out = str_replace("\'", "'", $out);
		$out = str_replace("\\\"", "\"", $out);
		
		$handle = fopen ($fn, 'w'); fwrite ($handle, $out); fclose($handle);				
	}
?>
