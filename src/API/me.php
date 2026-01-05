<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(200);
    echo json_encode(['authenticated' => false]);
    exit;
}

$stmt = $pdo->prepare("SELECT id, email, name FROM users WHERE id = ? LIMIT 1");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    // Session refers to non-existing user; reset
    $_SESSION = [];
    session_destroy();
    echo json_encode(['authenticated' => false]);
    exit;
}

echo json_encode([
    'authenticated' => true,
    'user' => [
        'id' => (int)$user['id'],
        'email' => $user['email'],
        'name' => $user['name']
    ]
]);
