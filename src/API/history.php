<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

// Only authenticated users may read history
ensure_authenticated();

if (!isset($_GET["lead_id"])) {
    echo json_encode([]);
    exit;
}

$id = (int) $_GET["lead_id"];

$stmt = $pdo->prepare("
    SELECT h.*, u.name as user_name, u.email as user_email 
    FROM lead_history h 
    LEFT JOIN users u ON h.user_id = u.id 
    WHERE h.lead_id=? 
    ORDER BY h.id DESC
");
$stmt->execute([$id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
