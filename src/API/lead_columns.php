<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

// Surface errors during development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$method = $_SERVER['REQUEST_METHOD'];

ensure_authenticated();

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

    // Default to a neutral gray when no color is supplied
    $colorInput = $data["color"] ?? null;
    $color = ($colorInput !== null && $colorInput !== '') ? $colorInput : '#d1d5db';
    error_log('lead_columns POST color=' . var_export($colorInput, true));

    $posStmt = $pdo->query("SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM lead_columns");
    $nextPos = $posStmt->fetchColumn();

    $stmt = $pdo->prepare("
    INSERT INTO lead_columns (name, position, color)
    VALUES (?, ?, ?)
");
    $stmt->execute([$data["name"], $nextPos, $color]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId(), "color" => $color]);
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

    $colorInput = $data["color"] ?? null;
    $color = ($colorInput !== null && $colorInput !== '') ? $colorInput : null;
    error_log('lead_columns PUT color=' . var_export($colorInput, true));

    $stmt = $pdo->prepare("UPDATE lead_columns SET name = ?, position = ?, color = COALESCE(?, color) WHERE id = ?");
    $stmt->execute([$data["name"], $data["position"], $color, $id]);

    echo json_encode(["success" => true, "color" => $color ?? 'unchanged']);
    exit;
}


if ($method === "DELETE") {
    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing column id"]);
        exit;
    }
    $id = $_GET["id"];

    // Block deletion when leads still reference this column
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
