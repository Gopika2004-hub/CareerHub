<?php
require_once "includes/db.php";

try {
    // Add category column if it doesn't already exist
    $pdo->exec("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT NULL DEFAULT NULL");
    echo json_encode(["success" => true, "message" => "Migration complete: category column added (or already exists)."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
