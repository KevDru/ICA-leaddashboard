<?php
require "db.php";

$method = $_SERVER["REQUEST_METHOD"];

// GET /columns
if ($method === "GET") {
    $stmt = $pdo->query("SELECT * FROM columns ORDER BY position ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST /columns
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data["name"] ?? null;

    if (!$name) {
        echo json_encode(["error" => "Column name required"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO columns (name, position) VALUES (?, (SELECT COALESCE(MAX(position),0)+1 FROM columns))");
    $stmt->execute([$name]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    exit;
}

// PUT /columns?id=1
if ($method === "PUT") {
    $id = $_GET["id"] ?? null;
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$id) { echo json_encode(["error" => "ID required"]); exit; }

    $stmt = $pdo->prepare("UPDATE columns SET name = ? WHERE id = ?");
    $stmt->execute([$data["name"], $id]);

    echo json_encode(["success" => true]);
    exit;
}

// DELETE /columns?id=1
if ($method === "DELETE") {
    $id = $_GET["id"] ?? null;

    if (!$id) { echo json_encode(["error" => "ID required"]); exit; }

    // Prevent deleting if column contains leads
    $check = $pdo->prepare("SELECT COUNT(*) FROM leads WHERE column_id = ?");
    $check->execute([$id]);

    if ($check->fetchColumn() > 0) {
        echo json_encode(["error" => "Column not empty"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM columns WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true]);
    exit;
}
