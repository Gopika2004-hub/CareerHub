<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CareerHub - Find Your Dream Job</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <!-- Lucide Icons (via CDN) -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
        }
        .navbar {
            backdrop-filter: blur(10px);
            background-color: rgba(255, 255, 255, 0.8) !important;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .btn-blue {
            background-color: #00529b;
            color: white;
            border-radius: 50px;
            font-weight: 600;
            padding: 10px 25px;
            transition: all 0.3s ease;
        }
        .btn-blue:hover {
            background-color: #003d73;
            color: white;
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(0, 82, 155, 0.4);
        }
        .card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light sticky-top">
        <div class="container">
            <a class="navbar-brand" href="index.php">
                <img src="../public/logo.png" alt="CareerHub" height="35">
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center gap-3">
                    <?php if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true): ?>
                        <li class="nav-item">
                            <a class="nav-link fw-semibold" href="dashboard.php">Dashboard</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link fw-semibold" href="logout.php">Logout</a>
                        </li>
                        <li class="nav-item">
                            <div class="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill">
                                <i data-lucide="user" class="size-sm"></i>
                                <span class="small fw-bold"><?php echo htmlspecialchars($_SESSION["full_name"]); ?></span>
                            </div>
                        </li>
                    <?php else: ?>
                        <li class="nav-item">
                            <a href="login.php" class="btn btn-outline-dark rounded-pill px-4">Candidate Login</a>
                        </li>
                        <li class="nav-item">
                            <a href="employer-login.php" class="btn btn-dark rounded-pill px-4">Employer Login</a>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </nav>
    <div class="container py-5">
