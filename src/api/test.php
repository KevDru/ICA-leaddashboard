<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo json_encode([
    'php_version' => PHP_VERSION,
    'pdo_available' => extension_loaded('pdo'),
    'pdo_mysql_available' => extension_loaded('pdo_mysql'),
    'session_status' => session_status(),
    'timestamp' => date('Y-m-d H:i:s')
]);

// Now try database connection
try {
    $host = "localhost";
    $dbname = "ica_leads";
    $user = "admin_leads";
    $pass = "Ztx677dm.";
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    echo "\nDatabase connection: SUCCESS";
} catch (Exception $e) {
    echo "\nDatabase connection: FAILED - " . $e->getMessage();
}
