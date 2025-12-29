<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

ensure_authenticated();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['lead_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing lead_id']);
        exit;
    }
    
    $stmt = $pdo->prepare("
        SELECT n.*, u.name as author_name
        FROM notes n
        LEFT JOIN users u ON n.created_by = u.id
        WHERE n.lead_id = ?
        ORDER BY n.created_at DESC
    ");
    $stmt->execute([$_GET['lead_id']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    
    if (!isset($data['lead_id']) || !isset($data['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing lead_id or content']);
        exit;
    }

    $lead_id = (int)$data['lead_id'];
    $content = trim($data['content']);

    if (empty($content)) {
        http_response_code(400);
        echo json_encode(['error' => 'Content cannot be empty']);
        exit;
    }

    // Verify lead exists
    $check = $pdo->prepare('SELECT id FROM leads WHERE id = ?');
    $check->execute([$lead_id]);
    if (!$check->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Lead not found']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO notes (lead_id, content, created_by)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([
        $lead_id,
        $content,
        $_SESSION['user_id'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'note' => [
            'id' => (int)$pdo->lastInsertId(),
            'lead_id' => $lead_id,
            'content' => $content,
            'created_by' => $_SESSION['user_id'] ?? null,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing note id']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    
    if (!isset($data['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing content']);
        exit;
    }

    $id = (int)$_GET['id'];
    $content = trim($data['content']);

    if (empty($content)) {
        http_response_code(400);
        echo json_encode(['error' => 'Content cannot be empty']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE notes SET content = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$content, $id]);

    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing note id']);
        exit;
    }

    $id = (int)$_GET['id'];
    $stmt = $pdo->prepare('DELETE FROM notes WHERE id = ?');
    $stmt->execute([$id]);

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
