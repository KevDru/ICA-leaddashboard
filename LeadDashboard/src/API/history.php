<?php
require "db.php";

$id = $_GET["lead_id"];

$stmt = $pdo->prepare("SELECT * FROM lead_history WHERE lead_id=? ORDER BY id DESC");
$stmt->execute([$id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
