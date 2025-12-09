<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


require "db.php";

$id = $_GET["lead_id"];

$stmt = $pdo->prepare("SELECT * FROM lead_history WHERE lead_id=? ORDER BY id DESC");
$stmt->execute([$id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
