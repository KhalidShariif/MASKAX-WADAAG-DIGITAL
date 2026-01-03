<?php
require_once 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action == 'login') {
    $data = getJsonInput();
    
    if (!empty($data['username']) && !empty($data['password'])) {
        $query = "SELECT * FROM users WHERE username = :username LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':username', $data['username']);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // In a real app, use password_verify(). For this migration, we check plain.
            if ($data['password'] == $user['password']) {
                unset($user['password']); // Don't send password back
                echo json_encode(["success" => true, "user" => $user]);
            } else {
                echo json_encode(["success" => false, "message" => "Invalid credentials"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "User not found"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Incomplete data"]);
    }
}

if ($action == 'register') {
    $data = getJsonInput();
    
    if (!empty($data['username']) && !empty($data['password'])) {
        // Check if exists
        $check = "SELECT id FROM users WHERE username = :u";
        $cstmt = $conn->prepare($check);
        $cstmt->bindParam(':u', $data['username']);
        $cstmt->execute();
        
        if ($cstmt->rowCount() > 0) {
            echo json_encode(["success" => false, "message" => "Username already exists"]);
            exit();
        }

        $query = "INSERT INTO users (username, password, shop_name, role) VALUES (:u, :p, :s, :r)";
        $stmt = $conn->prepare($query);
        
        $role = isset($data['role']) ? $data['role'] : 'staff';
        $shop = isset($data['shopName']) ? $data['shopName'] : 'My Shop';

        $stmt->bindParam(':u', $data['username']);
        $stmt->bindParam(':p', $data['password']);
        $stmt->bindParam(':s', $shop);
        $stmt->bindParam(':r', $role);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "User registered successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Registration failed"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Incomplete data"]);
    }
}
?>
