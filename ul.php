<?php
// Secret key. This must match the secret key in bookmarklet.js
$secret_key = "CHANGEME";

// Get values
$url = trim($_GET["img_url"]);
$sk = urldecode($_GET["secret_key"]);
$directory = urldecode($_GET["directory"]);
$resp_str = $_GET['resp_str'];
// Do we have all of the data?
if(!$url || !$directory || !sk) {
	exit;
}
// Save
if($secret_key == $sk) {
	$new_img = rand(1,9999).basename($url);
	file_put_contents($new_img, file_get_contents($url));
	$return = array();
	$return['status'] = 'success';
	$return['url'] = $directory.$new_img;
	$return['resp_str'] = $resp_str;
	echo 'pResponse('.json_encode($return).');';
} else {
	$return['status'] = 'failed';
	$return['fail_reason'] = 'Unauthorized: Keys must match.';
	$return['resp_str'] = $resp_str;
	echo 'pResponse('.json_encode($return).');';
}
?>
