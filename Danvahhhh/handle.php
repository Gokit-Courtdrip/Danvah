<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Create a log file
$logFile = 'debug.log';
file_put_contents($logFile, "Request received: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
file_put_contents($logFile, "POST data: " . print_r($_POST, true) . "\n", FILE_APPEND);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Wrap everything in a try-catch to ensure we always return JSON
try {
    // Database connection
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "danvah_insurance";

    try {
        $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        file_put_contents($logFile, "Database connection successful\n", FILE_APPEND);
    } catch (PDOException $e) {
        file_put_contents($logFile, "Database connection failed: " . $e->getMessage() . "\n", FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
        exit;
    }

    $action = $_POST['action'] ?? '';
    file_put_contents($logFile, "Action: " . $action . "\n", FILE_APPEND);

    if ($action == 'login') {
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        if (empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Email and password are required']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = MD5(?)");
            $stmt->execute([$email, $password]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => $user['full_name'],
                    'user_id' => $user['id']
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Login failed: ' . $e->getMessage()]);
        }
    } elseif ($action == 'register') {
        $fullName = $_POST['fullName'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $password = $_POST['password'] ?? '';

        file_put_contents($logFile, "Register data: $fullName, $email, $phone\n", FILE_APPEND);

        if (empty($fullName) || empty($email) || empty($phone) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }

        // Password validation
        if (strlen($password) < 8) {
            echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
            exit;
        }

        // Check for password complexity
        if (
            !preg_match('/[A-Z]/', $password) ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/\d/', $password) ||
            !preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password)
        ) {
            echo json_encode(['success' => false, 'message' => 'Password must contain uppercase, lowercase, numbers, and special characters']);
            exit;
        }

        try {
            // Check if email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Email already registered']);
                exit;
            }

            // Insert new user
            $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, MD5(?), NOW())");
            $stmt->execute([$fullName, $email, $phone, $password]);
            file_put_contents($logFile, "User registered successfully\n", FILE_APPEND);

            echo json_encode(['success' => true, 'message' => 'Registration successful']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
        }
    } elseif ($action == 'purchase') {
        $insuranceType = $_POST['insuranceType'] ?? '';
        $tier = $_POST['tier'] ?? '';
        $price = $_POST['price'] ?? '';
        $fullName = $_POST['fullName'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $address = $_POST['address'] ?? '';
        $paymentMethod = $_POST['paymentMethod'] ?? '';

        if (empty($insuranceType) || empty($tier) || empty($price) || empty($fullName) || empty($email)) {
            echo json_encode(['success' => false, 'message' => 'Required fields are missing']);
            exit;
        }

        try {
            // Generate policy number
            $policyNumber = 'DI' . date('Y') . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);

            // Check if user exists, if not create them
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                // Create new user
                $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, MD5('defaultpass'), NOW())");
                $stmt->execute([$fullName, $email, $phone]);
                $userId = $pdo->lastInsertId();
            } else {
                $userId = $user['id'];
            }

            // Insert policy
            $startDate = date('Y-m-d');
            $endDate = date('Y-m-d', strtotime('+1 year'));

            $stmt = $pdo->prepare("INSERT INTO policies (user_id, policy_number, insurance_type, insurance_tier, price, status, start_date, end_date, created_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, NOW())");
            $stmt->execute([$userId, $policyNumber, $insuranceType, $tier, $price, $startDate, $endDate]);

            $policyId = $pdo->lastInsertId();

            // Insert policy details
            $details = [
                ['field_name' => 'customer_address', 'field_value' => $address],
                ['field_name' => 'payment_method', 'field_value' => $paymentMethod],
                ['field_name' => 'purchase_date', 'field_value' => date('Y-m-d H:i:s')]
            ];

            foreach ($details as $detail) {
                $stmt = $pdo->prepare("INSERT INTO policy_details (policy_id, field_name, field_value) VALUES (?, ?, ?)");
                $stmt->execute([$policyId, $detail['field_name'], $detail['field_value']]);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Purchase successful',
                'policyNumber' => $policyNumber
            ]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Purchase failed: ' . $e->getMessage()]);
        }
    } elseif ($action == 'test') {
        echo json_encode(['success' => true, 'message' => 'AJAX connection successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action: ' . $action]);
    }
} catch (Exception $e) {
    // Catch any unexpected errors and return as JSON
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
