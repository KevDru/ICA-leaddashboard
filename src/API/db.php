<?php
$host = "localhost";
$dbname = "ica_leads";
$user = "admin_leads";
$pass = "P9jgN#JSEvKc^^mXHCyK";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed: " . $e->getMessage()]);
    exit;
}
