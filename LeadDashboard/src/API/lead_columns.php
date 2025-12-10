<?php
require "db.php";

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET") {
    $stmt = $pdo->query("SELECT * FROM lead_columns ORDER BY position ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data["name"])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing column name"]);
        exit;
    }

    $nextPos = $pdo->query("SELECT COALESCE(MAX(position),0)+1 FROM lead_columns")->fetchColumn();
    $stmt = $pdo->prepare("INSERT INTO lead_columns (name, position) VALUES (?, ?)");
    $stmt->execute([$data["name"], $nextPos]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    exit;
}

if ($method === "PUT") {
    $id = $_GET["id"] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing column id"]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("UPDATE lead_columns SET name = COALESCE(?, name), position = COALESCE(?, position) WHERE id = ?");
    $stmt->execute([$data["name"] ?? null, $data["position"] ?? null, $id]);
    echo json_encode(["success" => true]);
    exit;
}

if ($method === "DELETE") {
    $id = $_GET["id"] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing column id"]);
        exit;
    }

    $count = $pdo->prepare("SELECT COUNT(*) FROM leads WHERE column_id = ?");
    $count->execute([$id]);
    if ($count->fetchColumn() > 0) {
        http_response_code(400);
        echo json_encode(["error" => "Column not empty"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM lead_columns WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
