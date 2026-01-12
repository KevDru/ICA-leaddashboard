<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

ensure_authenticated();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all tags or tags for a specific lead
    if (isset($_GET['lead_id'])) {
        $stmt = $pdo->prepare("
            SELECT lt.*, t.id, t.name, t.color
            FROM lead_tags lt
            JOIN tags t ON lt.tag_id = t.id
            WHERE lt.lead_id = ?
            ORDER BY t.name ASC
        ");
        $stmt->execute([$_GET['lead_id']]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        // Get all tags
        $stmt = $pdo->prepare("
            SELECT * FROM tags ORDER BY name ASC
        ");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    
    if (isset($_GET['action']) && $_GET['action'] === 'assign') {
        // Assign a tag to a lead
        if (!isset($data['lead_id']) || !isset($data['tag_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing lead_id or tag_id']);
            exit;
        }

        $lead_id = (int)$data['lead_id'];
        $tag_id = (int)$data['tag_id'];

        // Verify lead exists
        $check = $pdo->prepare('SELECT id FROM leads WHERE id = ?');
        $check->execute([$lead_id]);
        if (!$check->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Lead not found']);
            exit;
        }

        // Verify tag exists
        $check = $pdo->prepare('SELECT id FROM tags WHERE id = ?');
        $check->execute([$tag_id]);
        if (!$check->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Tag not found']);
            exit;
        }

        // Check if already assigned
        $check = $pdo->prepare('SELECT 1 FROM lead_tags WHERE lead_id = ? AND tag_id = ?');
        $check->execute([$lead_id, $tag_id]);
        if ($check->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Tag already assigned to this lead']);
            exit;
        }

        // Assign tag
        $stmt = $pdo->prepare("
            INSERT INTO lead_tags (lead_id, tag_id) VALUES (?, ?)
        ");
        $stmt->execute([$lead_id, $tag_id]);

        // Get the tag details
        $stmt = $pdo->prepare('SELECT * FROM tags WHERE id = ?');
        $stmt->execute([$tag_id]);
        $tag = $stmt->fetch(PDO::FETCH_ASSOC);

        // Log to history
        try {
            $action = 'Tag toegevoegd: ' . $tag['name'];
            $hstmt = $pdo->prepare('INSERT INTO lead_history (lead_id, action, user_id) VALUES (?, ?, ?)');
            $hstmt->execute([$lead_id, $action, $_SESSION['user_id'] ?? null]);
        } catch (Throwable $e) {
            // History write failures are non-fatal
        }

        echo json_encode(['success' => true, 'leadTag' => ['lead_id' => $lead_id, 'tag_id' => $tag_id, 'tag' => $tag]]);
        exit;
    }

    // Create a new tag
    if (!isset($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing tag name']);
        exit;
    }

    $name = trim($data['name']);
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tag name cannot be empty']);
        exit;
    }

    $color = $data['color'] ?? '#6366f1';

    // Check if tag already exists
    $check = $pdo->prepare('SELECT id FROM tags WHERE LOWER(name) = LOWER(?)');
    $check->execute([$name]);
    if ($check->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Tag already exists']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO tags (name, color) VALUES (?, ?)
    ");
    $stmt->execute([$name, $color]);

    $newId = (int)$pdo->lastInsertId();
    echo json_encode(['success' => true, 'tag' => ['id' => $newId, 'name' => $name, 'color' => $color]]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (isset($_GET['action']) && $_GET['action'] === 'unassign') {
        // Remove a tag from a lead
        if (!isset($_GET['lead_id']) || !isset($_GET['tag_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing lead_id or tag_id']);
            exit;
        }

        $lead_id = (int)$_GET['lead_id'];
        $tag_id = (int)$_GET['tag_id'];

        // Get tag name for history
        $stmt = $pdo->prepare('SELECT name FROM tags WHERE id = ?');
        $stmt->execute([$tag_id]);
        $tag = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $pdo->prepare("
            DELETE FROM lead_tags WHERE lead_id = ? AND tag_id = ?
        ");
        $stmt->execute([$lead_id, $tag_id]);

        // Log to history
        try {
            $action = 'Tag verwijderd: ' . ($tag['name'] ?? 'Unknown');
            $hstmt = $pdo->prepare('INSERT INTO lead_history (lead_id, action, user_id) VALUES (?, ?, ?)');
            $hstmt->execute([$lead_id, $action, $_SESSION['user_id'] ?? null]);
        } catch (Throwable $e) {
            // History write failures are non-fatal
        }

        echo json_encode(['success' => true]);
        exit;
    }

    // Delete a tag
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing tag id']);
        exit;
    }

    $id = (int)$_GET['id'];

    // First remove all assignments
    $pdo->prepare('DELETE FROM lead_tags WHERE tag_id = ?')->execute([$id]);

    // Then delete the tag
    $stmt = $pdo->prepare('DELETE FROM tags WHERE id = ?');
    $stmt->execute([$id]);

    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];

    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing tag id']);
        exit;
    }

    $id = (int)$_GET['id'];
    $name = $data['name'] ?? null;
    $color = $data['color'] ?? null;

    if (!$name && !$color) {
        http_response_code(400);
        echo json_encode(['error' => 'Nothing to update']);
        exit;
    }

    if ($name) {
        $name = trim($name);
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Tag name cannot be empty']);
            exit;
        }
        $stmt = $pdo->prepare("UPDATE tags SET name = ? WHERE id = ?");
        $stmt->execute([$name, $id]);
    }

    if ($color) {
        $stmt = $pdo->prepare("UPDATE tags SET color = ? WHERE id = ?");
        $stmt->execute([$color, $id]);
    }

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
