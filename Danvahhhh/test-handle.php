<?php
// Simple test to check if handle.php is accessible
$result = file_get_contents('handle.php');
if ($result === false) {
    echo "Cannot access handle.php";
} else {
    echo "handle.php is accessible";
}
