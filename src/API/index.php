<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

$uri = explode("/", trim($_SERVER["REQUEST_URI"], "/"));
$endpoint = $uri[1] ?? null;

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

switch ($endpoint) {
    case "lead_columns": require "lead_columns.php"; break;
    case "leads": require "leads.php"; break;
    case "history": require "history.php"; break;
    default: echo json_encode(["error" => "Invalid endpoint"]);
}
