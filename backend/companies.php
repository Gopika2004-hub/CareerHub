<?php
require_once "includes/db.php";

// Headers are already handled in includes/db.php
// But we can add specific ones if needed.

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {

    case 'GET':
        try {
            $stmt = $pdo->prepare("SELECT * FROM companies");
            $stmt->execute();
            echo json_encode($stmt->fetchAll());
        } catch (PDOException $e) {
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        if (!isset($_POST['name']) || !isset($_FILES['logo'])) {
            echo json_encode(["error" => "Missing required fields"]);
            exit;
        }

        $name = $_POST['name'];
        $logo = $_FILES['logo'];

        // Use a unique name for the logo to avoid collisions
        $logoName = time() . "_" . basename($logo['name']);
        $uploadDir = "uploads/";
        
        // Ensure directory exists (should have been created by the task)
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $uploadPath = $uploadDir . $logoName;

        if (move_uploaded_file($logo['tmp_name'], $uploadPath)) {
            try {
                // ✅ DB insert
                $stmt = $pdo->prepare("INSERT INTO companies (name, logo_url) VALUES (?, ?)");
                $stmt->execute([$name, $uploadPath]);

                echo json_encode([
                    "success" => true,
                    "id" => $pdo->lastInsertId(),
                    "name" => $name,
                    "logo_url" => $uploadPath
                ]);
            } catch (PDOException $e) {
                echo json_encode(["error" => "Database error: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["error" => "Failed to upload file"]);
        }
        break;

    default:
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>