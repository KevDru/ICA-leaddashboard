<?php
require "db.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    if (!isset($_GET["column_id"])) {
        echo json_encode(["error"=>"column_id required"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM leads WHERE column_id = ? ORDER BY id DESC");
    $stmt->execute([$_GET["column_id"]]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
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

        $pdo->prepare("INSERT INTO lead_history (lead_id, action) VALUES (?, 'Moved column')")
            ->execute([$id]);

        echo json_encode(["success" => true]);
        exit;
    }

    $id = $_GET["id"];

    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("UPDATE leads SET title=?, customer=?, description=? WHERE id=?");
    $stmt->execute([$data["title"], $data["customer"], $data["description"], $id]);

    $pdo->prepare("INSERT INTO lead_history (lead_id, action) VALUES (?, 'Lead updated')")
        ->execute([$id]);

    echo json_encode(["success" => true]);
}
