<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'N/A',
    'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'N/A',
    'php_self' => $_SERVER['PHP_SELF'] ?? 'N/A',
    'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'N/A',
    'http_origin' => $_SERVER['HTTP_ORIGIN'] ?? 'N/A',
    'server_name' => $_SERVER['SERVER_NAME'] ?? 'N/A',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A'
], JSON_PRETTY_PRINT);
