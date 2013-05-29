<?php
// Secret key. This must match the secret key in bookmarklet.js
$secret_key = "CHANGEME";

// Get values
$url = trim($_GET["img_url"]);
$sk = urldecode($_GET["secret_key"]);
$directory = urldecode($_GET["directory"]);
$resp_str = $_GET['resp_str'];

// Return object
$return = array();
$return['resp_str'] = $resp_str;

// Attempt to copy the file
if(!$url || !$directory || !$sk || !$resp_str) {
	$return['status'] = 'failed';
	$return['fail_reason'] = 'Insufficient Data';
} elseif($secret_key != $sk) {
	$return['status'] = 'failed';
	$return['fail_reason'] = 'Unauthorized: Keys must match.';
} else {
	$new_img = rand(1,9999).basename($url);
	file_put_contents($new_img, file_get_contents($url));
	$return['status'] = 'success';
	$return['url'] = $directory.$new_img;
}
echo 'pResponse('.json_encode($return).');';
?>
