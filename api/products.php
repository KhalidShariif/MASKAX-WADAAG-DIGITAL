<?php
require_once 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'list';

if ($action == 'list') {
    $query = "SELECT * FROM products ORDER BY id DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($products);
}

if ($action == 'save') {
    $data = getJsonInput();
    
    if (isset($data['id']) && $data['id'] != '') {
        // Update
        $query = "UPDATE products SET name=:n, category=:c, price=:p, stock=:s WHERE id=:i";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':i', $data['id']);
    } else {
        // Create
        $query = "INSERT INTO products (name, category, price, stock) VALUES (:n, :c, :p, :s)";
        $stmt = $conn->prepare($query);
    }

    $stmt->bindParam(':n', $data['name']);
    $stmt->bindParam(':c', $data['category']);
    $stmt->bindParam(':p', $data['price']);
    $stmt->bindParam(':s', $data['stock']);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "id" => $conn->lastInsertId() ?: $data['id']]);
    } else {
        echo json_encode(["success" => false]);
    }
}

if ($action == 'delete') {
    $id = isset($_GET['id']) ? $_GET['id'] : '';
    if ($id) {
        $query = "DELETE FROM products WHERE id = :i";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':i', $id);
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false]);
        }
    }
}
?>
