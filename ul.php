<?php
// Secret key. This must match the secret key in bookmarklet.js
$secret_key = "CHANGEME";
//$directory = "//www.tylerbiscoe.com/testbook/";


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
$new_img = rand(1,9999).basename($url);
file_put_contents($new_img, file_get_contents($url));
$return = array();
$return['status'] = 'success';
$return['url'] = $directory.$new_img;
$return['full_path'] = realpath($directory.$new_img);
$return['test'] = $_SERVER['HTTP_HOST'];
$return['resp_str'] = $resp_str;
echo 'pResponse('.json_encode($return).');';
?>