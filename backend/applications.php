<?php
require_once "includes/db.php";

$token = verifyToken();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['job_id'])) {
            $stmt = $pdo->prepare("SELECT * FROM applications WHERE job_id = ?");
            $stmt->execute([$_GET['job_id']]);
            echo json_encode($stmt->fetchAll());
        } elseif (isset($_GET['candidate_id'])) {
            $stmt = $pdo->prepare("SELECT a.*, j.title as job_title, c.name as company_name FROM applications a JOIN jobs j ON a.job_id = j.id JOIN companies c ON j.company_id = c.id WHERE a.candidate_id = ?");
            $stmt->execute([$_GET['candidate_id']]);
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("INSERT INTO applications (job_id, candidate_id, name, experience, education, skills, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['job_id'],
            $data['candidate_id'],
            $data['name'],
            $data['experience'],
            $data['education'],
            $data['skills'],
            $data['resume_url']
        ]);
        echo json_encode(["id" => $pdo->lastInsertId(), "success" => true]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("UPDATE applications SET status = ? WHERE id = ?");
            $stmt->execute([$data['status'], $_GET['id']]);
            echo json_encode(["success" => true]);
        }
        break;
}
?>
