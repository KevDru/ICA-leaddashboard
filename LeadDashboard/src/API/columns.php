<?php
require "db.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $stmt = $pdo->query("SELECT * FROM columns ORDER BY position ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("
        INSERT INTO columns (name, position)
        VALUES (?, (SELECT COALESCE(MAX(position),0)+1 FROM columns))
    ");
    $stmt->execute([$data["name"]]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    exit;
}

if ($method === "PUT") {
    $id = $_GET["id"];

    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("UPDATE columns SET name = ?, position = ? WHERE id = ?");
    $stmt->execute([$data["name"], $data["position"], $id]);

    echo json_encode(["success" => true]);
    exit;
}

if ($method === "DELETE") {
    $id = $_GET["id"];

    // check empty column
    $count = $pdo->prepare("SELECT COUNT(*) FROM leads WHERE column_id = ?");
    $count->execute([$id]);

    if ($count->fetchColumn() > 0) {
        echo json_encode(["error" => "Column not empty"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM columns WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true]);
}
