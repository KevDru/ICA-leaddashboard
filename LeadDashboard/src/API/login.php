<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($data['email'] ?? '');
$password = (string)($data['password'] ?? '');

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required"]);
    exit;
}

$stmt = $pdo->prepare("SELECT id, email, password_hash, name FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
    exit;
}

$_SESSION['user_id'] = $user['id'];

echo json_encode([
    'success' => true,
    'user' => [
        'id' => (int)$user['id'],
        'email' => $user['email'],
        'name' => $user['name']
    ]
]);
