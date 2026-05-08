<?php
require_once "config.php";

$full_name = $email = $mobile = $password = $confirm_password = "";
$full_name_err = $email_err = $mobile_err = $password_err = $confirm_password_err = "";

if($_SERVER["REQUEST_METHOD"] == "POST"){
    // Validate full name
    if(empty(trim($_POST["full_name"]))){
        $full_name_err = "Please enter your full name.";
    } else{
        $full_name = trim($_POST["full_name"]);
    }

    // Validate email
    if(empty(trim($_POST["email"]))){
        $email_err = "Please enter an email.";
    } else{
        $sql = "SELECT id FROM users WHERE email = :email";
        if($stmt = $pdo->prepare($sql)){
            $stmt->bindParam(":email", $param_email, PDO::PARAM_STR);
            $param_email = trim($_POST["email"]);
            if($stmt->execute()){
                if($stmt->rowCount() == 1){
                    $email_err = "This email is already taken.";
                } else{
                    $email = trim($_POST["email"]);
                }
            } else{
                echo "Oops! Something went wrong. Please try again later.";
            }
            unset($stmt);
        }
    }

    // Validate mobile
    if(empty(trim($_POST["mobile"]))){
        $mobile_err = "Please enter your mobile number.";
    } else{
        $mobile = trim($_POST["mobile"]);
    }

    // Validate password
    if(empty(trim($_POST["password"]))){
        $password_err = "Please enter a password.";     
    } elseif(strlen(trim($_POST["password"])) < 6){
        $password_err = "Password must have at least 6 characters.";
    } else{
        $password = trim($_POST["password"]);
    }

    // Validate confirm password
    if(empty(trim($_POST["confirm_password"]))){
        $confirm_password_err = "Please confirm password.";     
    } else{
        $confirm_password = trim($_POST["confirm_password"]);
        if(empty($password_err) && ($password != $confirm_password)){
            $confirm_password_err = "Password did not match.";
        }
    }

    // Check input errors before inserting in database
    if(empty($full_name_err) && empty($email_err) && empty($mobile_err) && empty($password_err) && empty($confirm_password_err)){
        $sql = "INSERT INTO users (full_name, email, mobile, password, role) VALUES (:full_name, :email, :mobile, :password, 'candidate')";
        
        if($stmt = $pdo->prepare($sql)){
            $stmt->bindParam(":full_name", $param_full_name, PDO::PARAM_STR);
            $stmt->bindParam(":email", $param_email, PDO::PARAM_STR);
            $stmt->bindParam(":mobile", $param_mobile, PDO::PARAM_STR);
            $stmt->bindParam(":password", $param_password, PDO::PARAM_STR);
            
            $param_full_name = $full_name;
            $param_email = $email;
            $param_mobile = $mobile;
            $param_password = password_hash($password, PASSWORD_DEFAULT); // Creates a password hash
            
            if($stmt->execute()){
                // Redirect to login page
                header("location: login.php?registered=true");
            } else{
                echo "Something went wrong. Please try again later.";
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
                <h2 class="fw-bold text-white">Create Account</h2>
                <p class="text-muted">Join CareerHub as a candidate</p>
            </div>
            
            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
                <div class="mb-3">
                    <label class="form-label fw-semibold">Full Name</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i data-lucide="user" class="size-sm"></i></span>
                        <input type="text" name="full_name" class="form-control border-start-0 <?php echo (!empty($full_name_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $full_name; ?>" placeholder="John Doe">
                        <span class="invalid-feedback"><?php echo $full_name_err; ?></span>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Email Address</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i data-lucide="mail" class="size-sm"></i></span>
                        <input type="email" name="email" class="form-control border-start-0 <?php echo (!empty($email_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $email; ?>" placeholder="name@example.com">
                        <span class="invalid-feedback"><?php echo $email_err; ?></span>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Mobile Number</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i data-lucide="phone" class="size-sm"></i></span>
                        <input type="tel" name="mobile" class="form-control border-start-0 <?php echo (!empty($mobile_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $mobile; ?>" placeholder="+1 (555) 000-0000">
                        <span class="invalid-feedback"><?php echo $mobile_err; ?></span>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Password</label>
                        <input type="password" name="password" class="form-control <?php echo (!empty($password_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $password; ?>">
                        <span class="invalid-feedback"><?php echo $password_err; ?></span>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Confirm Password</label>
                        <input type="password" name="confirm_password" class="form-control <?php echo (!empty($confirm_password_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $confirm_password; ?>">
                        <span class="invalid-feedback"><?php echo $confirm_password_err; ?></span>
                    </div>
                </div>

                <div class="d-grid gap-2 mt-4">
                    <button type="submit" class="btn btn-blue py-3">Create Account</button>
                </div>

                <div class="text-center mt-4">
                    <p class="small text-muted">Already have an account? <a href="login.php" class="text-decoration-none fw-bold text-primary">Sign In</a></p>
                </div>
            </form>
        </div>
    </div>
</div>

<?php include "includes/footer.php"; ?>
