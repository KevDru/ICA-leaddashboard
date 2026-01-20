<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

$method = $_SERVER["REQUEST_METHOD"];

// All endpoints require an authenticated session
ensure_authenticated();

if ($method === "GET") {
    if (isset($_GET["id"])) {
        $stmt = $pdo->prepare("
            SELECT
                l.*,
                u.name as creator_name,
                (SELECT MAX(created_at) FROM lead_history h WHERE h.lead_id = l.id) AS last_history_at
            FROM leads l 
            LEFT JOIN users u ON l.created_by = u.id 
            WHERE l.id = ?
        ");
        $stmt->execute([$_GET["id"]]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        exit;
    }

    // Accept "cid" alias to avoid WAF false-positives on "column_id"
    $columnId = $_GET["cid"] ?? $_GET["column_id"] ?? null;
    if ($columnId !== null) {
        $stmt = $pdo->prepare("
            SELECT
                l.*,
                u.name as creator_name,
                (SELECT MAX(created_at) FROM lead_history h WHERE h.lead_id = l.id) AS last_history_at
            FROM leads l 
            LEFT JOIN users u ON l.created_by = u.id 
            WHERE l.column_id = ? 
            ORDER BY l.id DESC
        ");
        $stmt->execute([$columnId]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    echo json_encode(["error"=>"id or column_id required"]);
    exit;
}

if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $createdAt = isset($data["created_at"]) && !empty($data["created_at"]) ? $data["created_at"] : date('Y-m-d H:i:s');

    // Optional contact fields
    $contactName = $data["contact_name"] ?? null;
    $contactEmail = $data["contact_email"] ?? null;
    $contactPhone = $data["contact_phone"] ?? null;
    $value = isset($data["value"]) && $data["value"] !== '' ? (float)$data["value"] : null;

    $stmt = $pdo->prepare("
           INSERT INTO leads (title, customer, contact_name, contact_email, contact_phone, description, value, column_id, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $data["title"],
        $data["customer"],
           $contactName,
           $contactEmail,
           $contactPhone,
        $data["description"] ?? null,
        $value,
        $data["column_id"],
        $_SESSION['user_id'] ?? null,
        $createdAt
    ]);

    $id = $pdo->lastInsertId();

    // Record creation in history
    $pdo->prepare("INSERT INTO lead_history (lead_id, action, user_id) VALUES (?, 'Lead aangemaakt', ?)")
        ->execute([$id, $_SESSION['user_id']??null]);

    echo json_encode(["success" => true, "id" => $id]);
    exit;
}

if ($method === "PUT") {
    if (strpos($_SERVER['REQUEST_URI'], "move") !== false) {
        $id = $_GET["id"];

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $pdo->prepare("UPDATE leads SET column_id = ? WHERE id = ?");
        $stmt->execute([$data["column_id"], $id]);

        // Include column name in the history entry
        $colStmt = $pdo->prepare("SELECT name FROM lead_columns WHERE id = ?");
        $colStmt->execute([$data["column_id"]]);
        $column = $colStmt->fetch(PDO::FETCH_ASSOC);
        $columnName = $column ? $column['name'] : 'Unknown';

        $pdo->prepare("INSERT INTO lead_history (lead_id, action, user_id) VALUES (?, ?, ?)")
            ->execute([$id, 'Verplaatst naar kolom "' . $columnName . '"', $_SESSION['user_id']??null]);

        echo json_encode(["success" => true]);
        exit;
    }

    $id = $_GET["id"];

    $data = json_decode(file_get_contents("php://input"), true);

    // Reject updates with a blank title
    if (!isset($data["title"]) || empty(trim($data["title"]))) {
        http_response_code(400);
        echo json_encode(["error" => "Title is required"]);
        exit;
    }

    // Apply contact fields when provided
    $contactName = isset($data["contact_name"]) ? $data["contact_name"] : null;
    $contactEmail = isset($data["contact_email"]) ? $data["contact_email"] : null;
    $contactPhone = isset($data["contact_phone"]) ? $data["contact_phone"] : null;
    $value = isset($data["value"]) && $data["value"] !== '' ? (float)$data["value"] : null;

    $stmt = $pdo->prepare("UPDATE leads SET title=?, customer=?, contact_name=?, contact_email=?, contact_phone=?, description=?, value=?, created_at = COALESCE(NULLIF(?, ''), created_at) WHERE id=?");
    $stmt->execute([$data["title"], $data["customer"], $contactName, $contactEmail, $contactPhone, $data["description"], $value, $data["created_at"] ?? null, $id]);

    // Return affected row count to aid debugging
    $affected = $stmt->rowCount();

    $pdo->prepare("INSERT INTO lead_history (lead_id, action, user_id) VALUES (?, 'Lead bijgewerkt', ?)")
        ->execute([$id, $_SESSION['user_id']??null]);

    echo json_encode(["success" => true, "affected_rows" => $affected]);
}

if ($method === "DELETE") {
    $id = $_GET["id"];

    $stmt = $pdo->prepare("DELETE FROM leads WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true]);
    exit;
}
