<?php
require_once "config.php";

// Check if user is logged in
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}

// Fetch jobs from database
$sql = "SELECT * FROM jobs ORDER BY created_at DESC";
$jobs = [];
if($stmt = $pdo->prepare($sql)){
    if($stmt->execute()){
        $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>

<?php include "includes/header.php"; ?>

<div class="d-flex justify-content-between align-items-center mb-5">
    <div>
        <h1 class="fw-extrabold display-5">Candidate Dashboard</h1>
        <p class="text-muted">Welcome back, <?php echo htmlspecialchars($_SESSION["full_name"]); ?>!</p>
    </div>
    <div class="bg-white p-3 rounded-pill shadow-sm border">
        <span class="badge bg-primary rounded-pill px-3 py-2">Role: <?php echo ucfirst($_SESSION["role"]); ?></span>
    </div>
</div>

<h3 class="fw-bold mb-4">Latest Job Listings</h3>

<div class="row g-4">
    <?php if(empty($jobs)): ?>
        <div class="col-12 text-center py-5">
            <div class="bg-white p-5 rounded-3 border">
                <i data-lucide="briefcase" class="size-lg text-muted mb-3"></i>
                <h4>No jobs found</h4>
                <p class="text-muted">Check back later for new opportunities.</p>
            </div>
        </div>
    <?php else: ?>
        <?php foreach($jobs as $job): ?>
            <div class="col-md-6 lg-col-4">
                <div class="card h-100 p-4 transition-all hover-shadow">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="fw-bold mb-1"><?php echo htmlspecialchars($job["title"]); ?></h5>
                            <p class="text-primary small fw-bold mb-0"><?php echo htmlspecialchars($job["company"]); ?></p>
                        </div>
                        <span class="badge bg-light text-dark border"><?php echo htmlspecialchars($job["type"]); ?></span>
                    </div>
                    
                    <div class="d-flex gap-3 mb-4 text-muted small">
                        <div class="d-flex align-items-center gap-1">
                            <i data-lucide="map-pin" class="size-xs"></i>
                            <?php echo htmlspecialchars($job["location"]); ?>
                        </div>
                        <div class="d-flex align-items-center gap-1">
                            <i data-lucide="dollar-sign" class="size-xs"></i>
                            <?php echo htmlspecialchars($job["salary"]); ?>
                        </div>
                    </div>

                    <p class="text-muted small mb-4 flex-grow-1">
                        <?php echo htmlspecialchars(substr($job["description"], 0, 150)) . '...'; ?>
                    </p>

                    <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                        <span class="text-muted small">Posted: <?php echo date('M d, Y', strtotime($job["created_at"])); ?></span>
                        <a href="job-detail.php?id=<?php echo $job["id"]; ?>" class="btn btn-blue btn-sm">View Details</a>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>

<style>
    .hover-shadow:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.1) !important;
    }
    .size-lg { width: 48px; height: 48px; }
    .size-sm { width: 18px; height: 18px; }
    .size-xs { width: 14px; height: 14px; }
</style>

<?php include "includes/footer.php"; ?>
