<?php
require_once 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'list';

if ($action == 'list') {
    $query = "SELECT id, username, role, created_at FROM users WHERE role != 'admin' ORDER BY id DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

if ($action == 'delete') {
    $id = isset($_GET['id']) ? $_GET['id'] : '';
    if ($id) {
        $query = "DELETE FROM users WHERE id = :i";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':i', $id);
        echo json_encode(["success" => $stmt->execute()]);
    }
}

if ($action == 'update') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->id)) {
        if (!empty($data->password)) {
            // Update with password
            $query = "UPDATE users SET username = :u, password = :p, role = :r WHERE id = :id";
            $stmt = $conn->prepare($query);
            $hashed = password_hash($data->password, PASSWORD_DEFAULT);
            $stmt->bindParam(':p', $hashed);
        } else {
            // Update without password
            $query = "UPDATE users SET username = :u, role = :r WHERE id = :id";
            $stmt = $conn->prepare($query);
        }
        
        $stmt->bindParam(':u', $data->username);
        $stmt->bindParam(':r', $data->role);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Update failed"]);
        }
    }
}
?>