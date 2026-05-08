<?php
require_once "config.php";

// Check if the user is already logged in, if yes then redirect him to dashboard
if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    header("location: dashboard.php");
    exit;
}

$email = $password = "";
$email_err = $password_err = $login_err = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (empty(trim($_POST["email"]))) {
        $email_err = "Please enter email.";
    } else {
        $email = trim($_POST["email"]);
    }

    if (empty(trim($_POST["password"]))) {
        $password_err = "Please enter your password.";
    } else {
        $password = trim($_POST["password"]);
    }

    if (empty($email_err) && empty($password_err)) {
        $sql = "SELECT id, full_name, email, password, role FROM users WHERE email = :email";

        if ($stmt = $pdo->prepare($sql)) {
            $stmt->bindParam(":email", $param_email, PDO::PARAM_STR);
            $param_email = trim($_POST["email"]);

            if ($stmt->execute()) {
                if ($stmt->rowCount() == 1) {
                    if ($row = $stmt->fetch()) {
                        $id = $row["id"];
                        $full_name = $row["full_name"];
                        $hashed_password = $row["password"];
                        $role = $row["role"];

                        if (password_verify($password, $hashed_password)) {
                            // Password is correct, so start a new session
                            session_start();

                            // Store data in session variables
                            $_SESSION["loggedin"] = true;
                            $_SESSION["id"] = $id;
                            $_SESSION["full_name"] = $full_name;
                            $_SESSION["email"] = $email;
                            $_SESSION["role"] = $role;

                            // Redirect user to dashboard
                            header("location: dashboard.php");
                        } else {
                            $login_err = "Invalid email or password.";
                        }
                    }
                } else {
                    $login_err = "Invalid email or password.";
                }
            } else {
                echo "Oops! Something went wrong. Please try again later.";
            }
            unset($stmt);
        }
    }
    unset($pdo);
}
?>

<?php include "includes/header.php"; ?>

<div class="row justify-content-center">
    <div class="col-md-5">
        <div class="card p-4">
            <div class="text-center mb-4">
                <h2 class="fw-bold text-white login-title">Candidate Login</h2>
                <p class="text-muted">Enter your credentials to access your account</p>
            </div>

            <?php
            if (!empty($login_err)) {
                echo '<div class="alert alert-danger text-center small">' . $login_err . '</div>';
            }
            if (isset($_GET['registered']) && $_GET['registered'] == 'true') {
                echo '<div class="alert alert-success text-center small">Registration successful! Please login.</div>';
            }
            ?>

            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
                <div class="mb-3">
                    <label class="form-label fw-semibold">Email Address</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i data-lucide="mail"
                                class="size-sm"></i></span>
                        <input type="email" name="email"
                            class="form-control border-start-0 <?php echo (!empty($email_err)) ? 'is-invalid' : ''; ?>"
                            value="<?php echo $email; ?>" placeholder="name@example.com">
                        <span class="invalid-feedback"><?php echo $email_err; ?></span>
                    </div>
                </div>

                <div class="mb-3">
                    <div class="d-flex justify-content-between">
                        <label class="form-label fw-semibold">Password</label>
                        <a href="forgot-password.php" class="small text-primary fw-bold text-decoration-none">Forgot
                            Password?</a>
                    </div>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i data-lucide="lock"
                                class="size-sm"></i></span>
                        <input type="password" name="password"
                            class="form-control border-start-0 <?php echo (!empty($password_err)) ? 'is-invalid' : ''; ?>"
                            placeholder="••••••••">
                        <span class="invalid-feedback"><?php echo $password_err; ?></span>
                    </div>
                </div>

                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="remember">
                    <label class="form-check-label small fw-medium text-white" for="remember">Remember Me</label>
                </div>

                <div class="d-grid gap-2 mt-4">
                    <button type="submit" class="btn btn-blue py-3">Sign In <i data-lucide="arrow-right"
                            class="ms-2 size-sm"></i></button>
                </div>

                <div class="text-center mt-4 space-y-2">
                    <p class="small text-muted mb-1">Don't have an account? <a href="register.php"
                            class="text-decoration-none fw-bold text-primary">Register as Candidate</a></p>
                    <p class="small text-muted">Are you an employer? <a href="employer-login.php"
                            class="text-decoration-none fw-bold text-dark">Employer Login</a></p>
                </div>
            </form>
        </div>
    </div>
</div>

<?php include "includes/footer.php"; ?>