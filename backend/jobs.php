<?php
// Prevent PHP warnings from corrupting JSON output
ini_set('display_errors', '0');

require_once "includes/db.php";

$token = verifyToken();

// Ensure category column exists — try to add it, silently ignore if already exists
try {
    $pdo->exec("ALTER TABLE `jobs` ADD COLUMN `category` TEXT NULL DEFAULT NULL");
} catch (PDOException $e) {
    // Error 1060 = "Duplicate column name" means column already exists — fine to ignore
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT j.*, c.name as company_name, c.logo_url FROM jobs j LEFT JOIN companies c ON j.company_id = c.id WHERE j.id = ?");
            $stmt->execute([$_GET['id']]);
            $job = $stmt->fetch();

            if ($job) {
                $stmtApps = $pdo->prepare("SELECT * FROM applications WHERE job_id = ?");
                $stmtApps->execute([$_GET['id']]);
                $job['applications'] = $stmtApps->fetchAll();
                echo json_encode($job);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Job not found"]);
            }
        } else {
            $query = "SELECT j.*, c.name as company_name, c.logo_url FROM jobs j LEFT JOIN companies c ON j.company_id = c.id WHERE 1=1";
            $params = [];

            // State filter: match state column OR location column (jobs may store location as combined string)
            if (!empty($_GET['state'])) {
                $query .= " AND (j.state LIKE ? OR j.location LIKE ?)";
                $params[] = "%" . $_GET['state'] . "%";
                $params[] = "%" . $_GET['state'] . "%";
            }

            // City filter: match city column OR location column
            if (!empty($_GET['city'])) {
                $query .= " AND (j.city LIKE ? OR j.location LIKE ?)";
                $params[] = "%" . $_GET['city'] . "%";
                $params[] = "%" . $_GET['city'] . "%";
            }

            if (!empty($_GET['company_name'])) {
                $query .= " AND j.company_name LIKE ?";
                $params[] = "%" . $_GET['company_name'] . "%";
            }

            if (!empty($_GET['company_id'])) {
                $query .= " AND j.company_id = ?";
                $params[] = $_GET['company_id'];
            }

            if (!empty($_GET['category'])) {
                $query .= " AND j.category LIKE ?";
                $params[] = "%" . $_GET['category'] . "%";
            }

            if (!empty($_GET['search'])) {
                $query .= " AND j.title LIKE ?";
                $params[] = "%" . $_GET['search'] . "%";
            }

            if (!empty($_GET['recruiter_id'])) {
                $query .= " AND j.recruiter_id = ?";
                $params[] = $_GET['recruiter_id'];
            }

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'POST':
        $title               = $_POST['title']               ?? null;
        $description         = $_POST['description']         ?? null;
        $location            = $_POST['location']            ?? null;
        $state               = $_POST['state']               ?? null;
        $city                = $_POST['city']                ?? null;
        $company_id          = (isset($_POST['company_id']) && $_POST['company_id'] !== "" && $_POST['company_id'] !== "null") ? $_POST['company_id'] : null;
        $recruiter_id        = $_POST['recruiter_id']        ?? null;
        $company_name        = $_POST['company_name']        ?? null;
        $role_department     = $_POST['role_department']     ?? null;
        $job_type            = $_POST['job_type']            ?? null;
        $salary_range        = $_POST['salary_range']        ?? null;
        $experience_level    = $_POST['experience_level']    ?? null;
        $application_deadline= $_POST['application_deadline']?? null;
        $qualifications      = $_POST['qualifications']      ?? null;
        $company_size        = $_POST['company_size']        ?? null;
        $founded_year        = $_POST['founded_year']        ?? null;
        $contact_phone       = $_POST['contact_phone']       ?? null;
        $contact_email       = $_POST['contact_email']       ?? null;
        $category            = isset($_POST['category']) && $_POST['category'] !== '' ? $_POST['category'] : null;

        $logoUrl = null;
        if (isset($_FILES['company_logo']) && $_FILES['company_logo']['error'] === UPLOAD_ERR_OK) {
            $logo     = $_FILES['company_logo'];
            $logoName = time() . "_" . basename($logo['name']);
            $uploadDir = __DIR__ . "/uploads/";
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $uploadPath = $uploadDir . $logoName;
            if (move_uploaded_file($logo['tmp_name'], $uploadPath)) {
                $logoUrl = "/uploads/" . $logoName;
            }
        }

        try {
            $job_id = $_GET['id'] ?? null;

            if ($job_id) {
                // ── UPDATE existing job ──────────────────────────────────────
                $query = "UPDATE jobs SET
                    title = ?, description = ?, location = ?, state = ?, city = ?,
                    company_id = ?, recruiter_id = ?, company_name = ?, role_department = ?,
                    job_type = ?, salary_range = ?, experience_level = ?,
                    application_deadline = ?, qualifications = ?, company_size = ?,
                    founded_year = ?, contact_phone = ?, contact_email = ?";

                $params = [
                    $title, $description, $location, $state, $city, $company_id, $recruiter_id,
                    $company_name, $role_department, $job_type, $salary_range, $experience_level,
                    $application_deadline, $qualifications, $company_size, $founded_year,
                    $contact_phone, $contact_email
                ];

                if ($logoUrl) {
                    $query .= ", company_logo = ?";
                    $params[] = $logoUrl;
                }

                $query .= " WHERE id = ?";
                $params[] = $job_id;

                $stmt = $pdo->prepare($query);
                $stmt->execute($params);

                // Save category separately so it never blocks the main update
                try {
                    $pdo->prepare("UPDATE jobs SET category = ? WHERE id = ?")->execute([$category, $job_id]);
                } catch (PDOException $ignored) {}

                echo json_encode(["success" => true, "updated" => true]);

            } else {
                // ── INSERT new job ───────────────────────────────────────────
                $stmt = $pdo->prepare("INSERT INTO jobs (
                    title, description, location, state, city, company_id, recruiter_id,
                    company_logo, company_name, role_department, job_type, salary_range,
                    experience_level, application_deadline, qualifications, company_size,
                    founded_year, contact_phone, contact_email
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                $stmt->execute([
                    $title, $description, $location, $state, $city, $company_id, $recruiter_id,
                    $logoUrl, $company_name, $role_department, $job_type, $salary_range,
                    $experience_level, $application_deadline, $qualifications, $company_size,
                    $founded_year, $contact_phone, $contact_email
                ]);

                $newJobId = $pdo->lastInsertId();

                // Save category separately so it never blocks the insert
                try {
                    $pdo->prepare("UPDATE jobs SET category = ? WHERE id = ?")->execute([$category, $newJobId]);
                } catch (PDOException $ignored) {}

                echo json_encode(["id" => $newJobId, "success" => true]);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (isset($_GET['id'])) {
            $job_id = $_GET['id'];
            $input  = json_decode(file_get_contents("php://input"), true);

            if (isset($input['isOpen'])) {
                $stmt = $pdo->prepare("UPDATE jobs SET isOpen = ? WHERE id = ?");
                $stmt->execute([$input['isOpen'], $job_id]);
                echo json_encode(["success" => true]);
            } else {
                $title        = $input['title']        ?? null;
                $description  = $input['description']  ?? null;
                $location     = $input['location']     ?? null;
                $salary_range = $input['salary_range'] ?? null;

                $stmt = $pdo->prepare("UPDATE jobs SET title = ?, description = ?, location = ?, salary_range = ? WHERE id = ?");
                $stmt->execute([$title, $description, $location, $salary_range, $job_id]);
                echo json_encode(["success" => true]);
            }
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("DELETE FROM jobs WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode(["success" => true]);
        }
        break;
}
?>
