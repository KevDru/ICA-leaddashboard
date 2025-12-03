<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === "OPTIONS") {
    exit;
}

$uri = explode("/", trim($_SERVER["REQUEST_URI"], "/"));
$resource = $uri[1] ?? null;

switch ($resource) {
    case "columns":
        require "columns.php";
        break;

    case "leads":
        require "leads.php";
        break;

    default:
        echo json_encode(["error" => "Invalid endpoint"]);
        break;
}
