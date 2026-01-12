<?php
if (session_status() === PHP_SESSION_NONE) {
    // Detect if we're running over HTTPS
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
        || ($_SERVER['SERVER_PORT'] ?? 80) == 443
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    
    // Allow the SPA to send cookies cross-site (requires HTTPS in production)
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,  // Only require secure on HTTPS
        'httponly' => true,
        'samesite' => $isHttps ? 'None' : 'Lax'  // None requires secure=true
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
        // Fallback that permits reads but blocks credentialed requests
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

send_cors_headers();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
