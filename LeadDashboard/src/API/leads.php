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

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    // Get single lead by ID
    if (isset($_GET["id"])) {
        $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = ?");
        $stmt->execute([$_GET["id"]]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        exit;
    }

    // Get all leads in a column
    if (isset($_GET["column_id"])) {
        $stmt = $pdo->prepare("SELECT * FROM leads WHERE column_id = ? ORDER BY id DESC");
        $stmt->execute([$_GET["column_id"]]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    echo json_encode(["error"=>"id or column_id required"]);
    exit;
}

if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("
        INSERT INTO leads (title, customer, description, column_id)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([
        $data["title"],
        $data["customer"],
        $data["description"] ?? null,
        $data["column_id"]
    ]);

    $id = $pdo->lastInsertId();

    // history
    $pdo->prepare("INSERT INTO lead_history (lead_id, action) VALUES (?, 'Lead created')")
        ->execute([$id]);

    echo json_encode(["success" => true, "id" => $id]);
    exit;
}

if ($method === "PUT") {
    if (strpos($_SERVER['REQUEST_URI'], "move") !== false) {
        $id = $_GET["id"];

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $pdo->prepare("UPDATE leads SET column_id = ? WHERE id = ?");
        $stmt->execute([$data["column_id"], $id]);

        // Get the column name for history
        $colStmt = $pdo->prepare("SELECT name FROM lead_columns WHERE id = ?");
        $colStmt->execute([$data["column_id"]]);
        $column = $colStmt->fetch(PDO::FETCH_ASSOC);
        $columnName = $column ? $column['name'] : 'Unknown';

        $pdo->prepare("INSERT INTO lead_history (lead_id, action) VALUES (?, ?)")
            ->execute([$id, 'Moved to column "' . $columnName . '"']);

        echo json_encode(["success" => true]);
        exit;
    }

    $id = $_GET["id"];

    $data = json_decode(file_get_contents("php://input"), true);

    // Validate title is not empty
    if (!isset($data["title"]) || empty(trim($data["title"]))) {
        http_response_code(400);
        echo json_encode(["error" => "Title is required"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE leads SET title=?, customer=?, description=? WHERE id=?");
    $stmt->execute([$data["title"], $data["customer"], $data["description"], $id]);

    $pdo->prepare("INSERT INTO lead_history (lead_id, action) VALUES (?, 'Lead updated')")
        ->execute([$id]);

    echo json_encode(["success" => true]);
}

if ($method === "DELETE") {
    $id = $_GET["id"];

    $stmt = $pdo->prepare("DELETE FROM leads WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true]);
    exit;
}
