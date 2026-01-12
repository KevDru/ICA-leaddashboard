<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
ensure_authenticated();

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, name, color FROM tags ORDER BY name ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['name']) || !trim($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        exit;
    }
    $color = $data['color'] ?? '#d1d5db';
    $stmt = $pdo->prepare("INSERT INTO tags (name, color) VALUES (?, ?)");
    $stmt->execute([trim($data['name']), $color]);
    $id = $pdo->lastInsertId();
    echo json_encode(['id' => (int)$id, 'name' => $data['name'], 'color' => $color]);
    exit;
}

if ($method === 'PUT') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'id is required']);
        exit;
    }
    $id = (int)$_GET['id'];
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['name']) && !trim($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name cannot be empty']);
        exit;
    }
    $stmt = $pdo->prepare("UPDATE tags SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ?");
    $stmt->execute([
        isset($data['name']) ? trim($data['name']) : null,
        $data['color'] ?? null,
        $id
    ]);
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'id is required']);
        exit;
    }
    $id = (int)$_GET['id'];
    $pdo->prepare('DELETE FROM lead_tags WHERE tag_id = ?')->execute([$id]);
    $pdo->prepare('DELETE FROM tags WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
