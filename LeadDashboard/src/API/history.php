<?php
require "db.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$lead_id = $_GET["lead_id"] ?? null;
if (!$lead_id) {
    http_response_code(400);
    echo json_encode(["error" => "Missing lead_id"]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM lead_history WHERE lead_id=? ORDER BY id DESC");
$stmt->execute([$lead_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
