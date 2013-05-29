<?php
// Secret key. This must match the secret key in bookmarklet.js
$secret_key = "CHANGEME";
// Get/Set values
$url = urldecode($_GET["img_url"]);
$sk = urldecode($_GET["secret_key"]);
$file_path = rand(1,9999).basename($url);
$return = array("resp_str" => urldecode($_GET["resp_str"]), "full_path" => urldecode($_GET["directory"]).$file_path);

if(!$url || !$file_path || !$sk) { // Ensure we have all of the required data
	$return["status"] = "failed";
	$return["fail_reason"] = "Missing Data";
} elseif($secret_key != $sk) { // Make sure we're authorized
	$return["status"] = "failed";
	$return["fail_reason"] = "Unauthorized: Keys must match.";
} else {
	if(file_put_contents($file_path, file_get_contents($url))) {
		$return["status"] = "success";
		$return["url"] = urldecode($_GET["directory"]).$file_path;
	} else {
		$return["status"] = "failed";
		$return["fail_reason"] = "Unknown Error";
	}
}
echo 'pResponse('.json_encode($return).')';
?>
