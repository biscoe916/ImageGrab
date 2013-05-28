<?php

// Secret key. This must match the secret key in bookmarklet.js
$secret_key = "CHANGEME";
$directory = "./";




// Get values
$url = trim($_GET["img_url"]);
$sk = $_GET["secret_key"];

// Do we have all of the data?
if(!$url || !$directory || !sk) {
	exit;
}

// Save the file
$file = fopen($url, "rb");
$valid_exts = array("jpg", "jpeg", "gif", "png");
$ext = pathinfo($url, PATHINFO_EXTENSION);
if($secret_key == $sk) {
	if(in_array($ext,$valid_exts)){
		$ul_name = rand(1,9999).basename($url);
		$ul_file = fopen($directory.$ul_name, "wb");
		while(!feof($file)) {
			fwrite($ul_file,fread($file,1024 * 128),1024 * 128);
		}
		echo "You Win.";
	}
} else {
	echo "NOT AUTHORIZED";
}
?>