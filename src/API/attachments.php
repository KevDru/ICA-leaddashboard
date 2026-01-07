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
        SELECT a.*, u.name as uploader_name
        FROM attachments a
        LEFT JOIN users u ON a.uploaded_by = u.id
        WHERE a.lead_id = ?
        ORDER BY a.created_at DESC
    ");
    $stmt->execute([$_GET['lead_id']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['lead_id']) || !isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing lead_id or file']);
        exit;
    }

    $lead_id = (int)$_POST['lead_id'];
    $file = $_FILES['file'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize in php.ini',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE in HTML form',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension',
        ];
        $message = $errorMessages[$file['error']] ?? 'Unknown upload error: ' . $file['error'];
        http_response_code(400);
        echo json_encode(['error' => $message]);
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

    // Create uploads directory if not exists
    $uploadsDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }

    // Generate unique filename
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('attach_') . '.' . $ext;
    $filepath = $uploadsDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO attachments (lead_id, file_name, file_path, file_size, uploaded_by)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $lead_id,
        $file['name'],
        $filename,
        $file['size'],
        $_SESSION['user_id'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'attachment' => [
            'id' => (int)$pdo->lastInsertId(),
            'lead_id' => $lead_id,
            'file_name' => $file['name'],
            'file_path' => $filename,
            'file_size' => $file['size'],
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing attachment id']);
        exit;
    }

    $id = (int)$_GET['id'];
    $stmt = $pdo->prepare('SELECT file_path FROM attachments WHERE id = ?');
    $stmt->execute([$id]);
    $attachment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$attachment) {
        http_response_code(404);
        echo json_encode(['error' => 'Attachment not found']);
        exit;
    }

    // Delete file
    $filepath = __DIR__ . '/../uploads/' . $attachment['file_path'];
    if (file_exists($filepath)) {
        unlink($filepath);
    }

    // Delete database record
    $del = $pdo->prepare('DELETE FROM attachments WHERE id = ?');
    $del->execute([$id]);

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
