<?php
// Common auth + CORS helpers

// Sessions
if (session_status() === PHP_SESSION_NONE) {
    // Allow cross-site cookies for the SPA domain (requires HTTPS)
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => true,      // send only over HTTPS
        'httponly' => true,
        'samesite' => 'None'   // allow cross-site requests
    ]);
    session_start();
}

function send_cors_headers() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = [
        'http://localhost:4200',
        'http://127.0.0.1:4200',
        'http://localhost',
        'http://127.0.0.1',
        'https://leads.imaginecreativeagency.nl',
        'http://leads.imaginecreativeagency.nl'
    ];
    $isLocalDynamic = false;
    if ($origin) {
        $parts = parse_url($origin);
        $host = $parts['host'] ?? '';
        $scheme = $parts['scheme'] ?? 'http';
        if ($host === 'localhost' || $host === '127.0.0.1') {
            $isLocalDynamic = true;
        }
    }
    if ($origin && (in_array($origin, $allowedOrigins, true) || $isLocalDynamic)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Vary: Origin");
        header("Access-Control-Allow-Credentials: true");
    } else {
        // Fallback (no credentials will be allowed by browsers)
        header("Access-Control-Allow-Origin: *");
    }
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Content-Type: application/json");
}

function ensure_authenticated() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }
}

// Handle preflight early
send_cors_headers();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
