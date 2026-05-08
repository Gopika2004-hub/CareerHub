<?php
require_once "includes/db.php";

$token = verifyToken();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get all saved jobs for the current user
        try {
            $user_id = $token;
            
            $stmt = $pdo->prepare("
                SELECT 
                    sj.id,
                    sj.user_id,
                    sj.job_id,
                    sj.created_at,
                    j.id as job_id,
                    j.title,
                    j.description,
                    j.location,
                    j.state,
                    j.city,
                    j.company_id,
                    j.recruiter_id,
                    j.isOpen,
                    j.created_at as job_created_at,
                    j.company_logo,
                    j.company_name,
                    j.role_department,
                    j.job_type,
                    j.salary_range,
                    j.experience_level,
                    j.application_deadline,
                    j.qualifications,
                    j.company_size,
                    j.founded_year,
                    j.contact_phone,
                    j.contact_email,
                    c.logo_url as company_logo_url
                FROM saved_jobs sj
                LEFT JOIN jobs j ON sj.job_id = j.id
                LEFT JOIN companies c ON j.company_id = c.id
                WHERE sj.user_id = ?
                ORDER BY sj.created_at DESC
            ");
            
            $stmt->execute([$user_id]);
            $saved_jobs = $stmt->fetchAll();
            
            // Transform the data to include job details
            $result = array_map(function($row) {
                return [
                    'id' => $row['id'],
                    'user_id' => $row['user_id'],
                    'job_id' => $row['job_id'],
                    'created_at' => $row['created_at'],
                    'job' => [
                        'id' => $row['job_id'],
                        'title' => $row['title'],
                        'description' => $row['description'],
                        'location' => $row['location'],
                        'state' => $row['state'],
                        'city' => $row['city'],
                        'company_id' => $row['company_id'],
                        'recruiter_id' => $row['recruiter_id'],
                        'isOpen' => $row['isOpen'],
                        'created_at' => $row['job_created_at'],
                        'company_logo' => $row['company_logo'],
                        'company_name' => $row['company_name'],
                        'role_department' => $row['role_department'],
                        'job_type' => $row['job_type'],
                        'salary_range' => $row['salary_range'],
                        'experience_level' => $row['experience_level'],
                        'application_deadline' => $row['application_deadline'],
                        'qualifications' => $row['qualifications'],
                        'company_size' => $row['company_size'],
                        'founded_year' => $row['founded_year'],
                        'contact_phone' => $row['contact_phone'],
                        'contact_email' => $row['contact_email'],
                        'company_logo_url' => $row['company_logo_url']
                    ]
                ];
            }, $saved_jobs);
            
            echo json_encode($result);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Save a job
        try {
            $user_id = $token;
            $input = json_decode(file_get_contents('php://input'), true);
            
            $job_id = $input['job_id'] ?? null;
            
            if (!$job_id) {
                http_response_code(400);
                echo json_encode(["error" => "job_id is required"]);
                exit;
            }
            
            // Check if already saved
            $checkStmt = $pdo->prepare("SELECT id FROM saved_jobs WHERE user_id = ? AND job_id = ?");
            $checkStmt->execute([$user_id, $job_id]);
            
            if ($checkStmt->fetch()) {
                http_response_code(400);
                echo json_encode(["error" => "Job already saved"]);
                exit;
            }
            
            $stmt = $pdo->prepare("INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)");
            $stmt->execute([$user_id, $job_id]);
            
            echo json_encode(["id" => $pdo->lastInsertId(), "success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Remove saved job
        try {
            $user_id = $token;
            $input = json_decode(file_get_contents('php://input'), true);
            
            $job_id = $input['job_id'] ?? null;
            
            if (!$job_id) {
                http_response_code(400);
                echo json_encode(["error" => "job_id is required"]);
                exit;
            }
            
            $stmt = $pdo->prepare("DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?");
            $stmt->execute([$user_id, $job_id]);
            
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}
?>
