<?php
require_once "backend/includes/db.php";
$stmt = $pdo->query("DESCRIBE jobs");
echo json_encode($stmt->fetchAll());
?>
