<?php
// Disable error display to prevent HTML output
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/auth.php';

// Get endpoint from PATH_INFO (set by .htaccess rewrite)
// When .htaccess rewrites /login to /index.php, PATH_INFO contains /login
$path_info = $_SERVER['PATH_INFO'] ?? '';
$path_info = trim($path_info, '/');

// Remove query string if present
if (strpos($path_info, '?') !== false) {
    $path_info = explode('?', $path_info)[0];
}

// Get the first part as endpoint
$parts = explode('/', $path_info);
$endpoint = !empty($parts[0]) ? $parts[0] : null;

// Debug: log what we're getting (only to error log, not to output)
error_log("PATH_INFO: " . ($_SERVER['PATH_INFO'] ?? 'not set'));
error_log("Extracted endpoint: " . ($endpoint ?? 'null'));

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

switch ($endpoint) {
    case "lead_columns": require __DIR__ . "/lead_columns.php"; break;
    case "leads": require __DIR__ . "/leads.php"; break;
    case "history": require __DIR__ . "/history.php"; break;
    case "attachments": require __DIR__ . "/attachments.php"; break;
    case "notes": require __DIR__ . "/notes.php"; break;
    case "stats": require __DIR__ . "/stats.php"; break;
    case "login": require __DIR__ . "/login.php"; break;
    case "register": require __DIR__ . "/register.php"; break;
    case "logout": require __DIR__ . "/logout.php"; break;
    case "me": require __DIR__ . "/me.php"; break;
    default: echo json_encode(["error" => "Invalid endpoint"]);
}
