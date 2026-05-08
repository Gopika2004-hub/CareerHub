<?php
require_once "includes/db.php";

$email = "balagopikaloganathan@gmail.com";

try {
    // Delete from local users table (if using PHP/MySQL version)
    $stmt = $pdo->prepare("DELETE FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    echo "<div style='font-family: sans-serif; text-align: center; margin-top: 50px;'>";
    echo "<h1 style='color: #00529b;'>Process Complete</h1>";
    echo "<p>If the user <b>$email</b> existed in your local database, they have been removed.</p>";
    echo "<hr style='width: 50%; margin: 20px auto;'>";
    echo "<p style='color: #666;'><b>Reminder:</b> If you are seeing the 'Email Taken' error in the React app, <br>you must also delete the user from your <b>Clerk Dashboard</b> at dashboard.clerk.com.</p>";
    echo "<a href='../php/register.php' style='display: inline-block; padding: 10px 20px; background: #00529b; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;'>Return to Registration</a>";
    echo "</div>";
} catch(PDOException $e) {
    echo "<h1>Error</h1>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
