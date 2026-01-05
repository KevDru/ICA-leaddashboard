<?php
require "db.php";

// ----------------------
// Enable error reporting (for dev)
// ----------------------
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

// ----------------------
// CORS headers
// ----------------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['http://localhost:4200','https://leads.imaginecreativeagency.nl'];

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ----------------------
// Determine HTTP method
// ----------------------
$method = $_SERVER['REQUEST_METHOD'];

// ----------------------
// GET: fetch all columns
// ----------------------
if ($method === "GET") {
    $stmt = $pdo->query("SELECT * FROM lead_columns ORDER BY position ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// ----------------------
// POST: create new column
// ----------------------
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["name"])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing column name"]);
        exit;
    }

    $posStmt = $pdo->query("SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM lead_columns");
    $nextPos = $posStmt->fetchColumn();

    $stmt = $pdo->prepare("
    INSERT INTO lead_columns (name, position)
    VALUES (?, ?)
");
    $stmt->execute([$data["name"], $nextPos]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    exit;
}


if ($method === "PUT") {
    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing column id"]);
        exit;
    }
    $id = $_GET["id"];
    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("UPDATE lead_columns SET name = ?, position = ? WHERE id = ?");
    $stmt->execute([$data["name"], $data["position"], $id]);

    echo json_encode(["success" => true]);
    exit;
}

// ----------------------
// DELETE: delete column
// ----------------------
if ($method === "DELETE") {
    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing column id"]);
        exit;
    }
    $id = $_GET["id"];

    // Check if column has leads
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

// ----------------------
// Fallback for unknown methods
// ----------------------
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
