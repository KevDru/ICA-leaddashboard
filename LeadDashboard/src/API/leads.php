<?php
require "db.php";

$method = $_SERVER["REQUEST_METHOD"];

// GET /leads?column_id=1
if ($method === "GET") {
    $columnId = $_GET["column_id"] ?? null;

    if (!$columnId) {
        echo json_encode(["error" => "column_id required"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM leads WHERE column_id = ? ORDER BY id DESC");
    $stmt->execute([$columnId]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST /leads
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $title = $data["title"] ?? null;
    $customer = $data["customer"] ?? null;
    $columnId = $data["column_id"] ?? null;

    if (!$title || !$customer || !$columnId) {
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO leads (title, customer, column_id) VALUES (?, ?, ?)");
    $stmt->execute([$title, $customer, $columnId]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    exit;
}

// PUT /leads/move?id=10
if ($method === "PUT" && strpos($_SERVER["REQUEST_URI"], "move") !== false) {
    $id = $_GET["id"] ?? null;

    if (!$id) { echo json_encode(["error" => "ID required"]); exit; }

    $data = json_decode(file_get_contents("php://input"), true);
    $columnId = $data["column_id"] ?? null;

    $stmt = $pdo->prepare("UPDATE leads SET column_id = ? WHERE id = ?");
    $stmt->execute([$columnId, $id]);

    echo json_encode(["success" => true]);
    exit;
}

// DELETE /leads?id=10
if ($method === "DELETE") {
    $id = $_GET["id"] ?? null;

    if (!$id) { echo json_encode(["error" => "ID required"]); exit; }

    $stmt = $pdo->prepare("DELETE FROM leads WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true]);
    exit;
}
