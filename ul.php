<?php
// Secret key. This must match the secret key in bookmarklet.js
$secret_key = "CHANGEME";
// Get/Set values
$url = urldecode($_GET["img_url"]);
$sk = urldecode($_GET["secret_key"]);
$file_path = urldecode($_GET["directory"]).rand(1,9999).basename($url);
$resp_str = $_GET["resp_str"]
$return = array("resp_str" => $resp_str);
if(!$url || !$file_path || !$sk || !$resp_str) { // Ensure we have all of the required data
	$return["status"] = "failed";
	$return["fail_reason"] = "Missing Data";
} elseif($secret_key != $sk) { // Make sure we're authorized
	$return["status"] = "failed";
	$return["fail_reason"] = "Unauthorized: Keys must match.";
} else {
	if(file_put_contents($file_path, file_get_contents($url))) {
		$return["status"] = "success";
		$return["url"] = $file_path;
	} else {
		$return["status"] = "failed";
		$return["fail_reason"] = "Unknown Error";
	}
}
echo 'pResponse('.json_encode($return).')';
?>
