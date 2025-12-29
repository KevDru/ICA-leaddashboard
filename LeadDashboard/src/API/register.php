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
$name = trim($data['name'] ?? '');

if (!$email || !$password || !$name) {
    http_response_code(400);
    echo json_encode(["error" => "Name, email and password are required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email"]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["error" => "Password must be at least 6 characters"]);
    exit;
}

// Check if user exists
$check = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$check->execute([$email]);
if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(["error" => "Email already registered"]);
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$ins = $pdo->prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)");
$ins->execute([$email, $hash, $name]);

$_SESSION['user_id'] = (int)$pdo->lastInsertId();

echo json_encode([
    'success' => true,
    'user' => [
        'id' => (int)$_SESSION['user_id'],
        'email' => $email,
        'name' => $name
    ]
]);
