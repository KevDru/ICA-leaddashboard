<?php
require_once __DIR__ . '/auth.php';

$uri = explode("/", trim($_SERVER["REQUEST_URI"], "/"));
$endpoint = $uri[1] ?? null;

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

switch ($endpoint) {
    case "lead_columns": require __DIR__ . "/lead_columns.php"; break;
    case "leads": require __DIR__ . "/leads.php"; break;
    case "history": require __DIR__ . "/history.php"; break;
    case "attachments": require __DIR__ . "/attachments.php"; break;
    case "notes": require __DIR__ . "/notes.php"; break;
    case "login": require __DIR__ . "/login.php"; break;
    case "register": require __DIR__ . "/register.php"; break;
    case "logout": require __DIR__ . "/logout.php"; break;
    case "me": require __DIR__ . "/me.php"; break;
    default: echo json_encode(["error" => "Invalid endpoint"]);
}
