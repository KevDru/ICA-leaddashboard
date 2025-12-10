<?php
require "db.php";

// ----------------------
// CORS headers
// ----------------------
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$method = $_SERVER['REQUEST_METHOD'];

// ----------------------
// GET: fetch lead by ID or by column
// ----------------------
if ($method === "GET") {
    if (isset($_GET["id"])) {
        $stmt = $pdo->prepare("SELECT * FROM leads WHERE id=?");
        $stmt->execute([$_GET["id"]]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } elseif (isset($_GET["column_id"])) {
        $stmt = $pdo->prepare("SELECT * FROM leads WHERE column_id=? ORDER BY id DESC");
        $stmt->execute([$_GET["column_id"]]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        echo json_encode(["error" => "Missing parameters"]);
    }
    exit;
}

// ----------------------
// POST: create new lead
// ----------------------
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $title = $data["title"] ?? '';
    $customer = $data["customer"] ?? '';
    $description = $data["description"] ?? '';
    $column_id = $data["column_id"] ?? 0;

    if (!$title || !$column_id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing title or column_id"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO leads (title, customer, description, column_id) VALUES (?, ?, ?, ?)");
    $stmt->execute([$title, $customer, $description, $column_id]);
    $id = $pdo->lastInsertId();

    // Log creation
    $pdo->prepare("INSERT INTO lead_history (lead_id, action) VALUES (?, 'Lead created')")->execute([$id]);

    echo json_encode(["success" => true, "id" => $id]);
    exit;
}

// ----------------------
// PUT: update lead fields or move column
// ----------------------
if ($method === "PUT") {
    $id = $_GET["id"] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing lead id"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    // Move lead to another column
    if (isset($data["column_id"])) {
        $stmt = $pdo->prepare("UPDATE leads SET column_id=? WHERE id=?");
        $stmt->execute([$data["column_id"], $id]);
        $pdo->prepare("INSERT INTO lead_history (lead_id, action) VALUES (?, 'Moved column')")->execute([$id]);
        echo json_encode(["success" => true]);
        exit;
    }

    // Update lead fields
    $title = $data["title"] ?? '';
    $customer = $data["customer"] ?? '';
    $description = $data["description"] ?? '';

    $stmt = $pdo->prepare("UPDATE leads SET title=?, customer=?, description=? WHERE id=?");
    $stmt->execute([$title, $customer, $description, $id]);
    $pdo->prepare("INSERT INTO lead_history (lead_id, action) VALUES (?, 'Lead updated')")->execute([$id]);

    echo json_encode(["success" => true]);
    exit;
}

// ----------------------
// DELETE: delete lead
// ----------------------
if ($method === "DELETE") {
    $id = $_GET["id"] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing lead id"]);
        exit;
    }

    // Log deletion first
    $pdo->prepare("INSERT INTO lead_history (lead_id, action) VALUES (?, 'Lead deleted')")->execute([$id]);

    // Delete lead (history table will auto-delete remaining records if ON DELETE CASCADE)
    $stmt = $pdo->prepare("DELETE FROM leads WHERE id=?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true]);
    exit;
}

// ----------------------
// Unsupported method fallback
// ----------------------
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
