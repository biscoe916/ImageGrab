<?php
// Secret key. This must match the secret key in bookmarklet.js
$secret_key = "CHANGEME";
// Get/Set values
$url = trim($_GET["img_url"]);
$sk = urldecode($_GET["secret_key"]);
$directory = urldecode($_GET["directory"]);
$resp_str = $_GET['resp_str'];
$new_image_name = rand(1,9999).basename($url);

if(!$url || !$directory || !$sk || !$resp_str) { // Ensure we have all of the required data
	$return['status'] = 'failed';
	$return['fail_reason'] = 'Missing Data';
} elseif($secret_key != $sk) { // Make sure we're authorized
	$return['status'] = 'failed';
	$return['fail_reason'] = 'Unauthorized: Keys must match.';
} else {
	if(file_put_contents($new_img, file_get_contents($url))) {
		$return['status'] = 'success';
		$return['url'] = $directory.$new_img;
	} else {
		$return['status'] = 'failed';
		$return['fail_reason'] = 'Unknown Error';
	}
}
?>


























