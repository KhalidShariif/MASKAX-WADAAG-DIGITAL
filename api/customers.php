<?php
require_once 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'list';

if ($action == 'list') {
    $query = "SELECT * FROM customers ORDER BY name ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

if ($action == 'save') {
    $data = getJsonInput();
    if (isset($data['id']) && $data['id'] != '') {
        $query = "UPDATE customers SET name=:n, contact=:c, debt=:d WHERE id=:i";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':i', $data['id']);
    } else {
        $query = "INSERT INTO customers (name, contact, debt) VALUES (:n, :c, :d)";
        $stmt = $conn->prepare($query);
    }
    $stmt->bindParam(':n', $data['name']);
    $stmt->bindParam(':c', $data['contact']);
    $stmt->bindParam(':d', $data['debt']);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "id" => $conn->lastInsertId() ?: $data['id']]);
    } else {
        echo json_encode(["success" => false]);
    }
}

if ($action == 'get_history') {
    $id = isset($_GET['id']) ? $_GET['id'] : '';
    if ($id) {
        $query = "SELECT * FROM customer_transactions WHERE customer_id = :i ORDER BY created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':i', $id);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}

if ($action == 'add_debt') {
    $data = getJsonInput();
    $id = $data['id'];
    $amount = $data['amount'];
    $type = $data['type']; // PAYMENT or DEBT_ADD
    $details = $data['details'];

    try {
        $conn->beginTransaction();

        // Update customer debt
        $cQuery = "UPDATE customers SET debt = debt + :a WHERE id = :i";
        $cStmt = $conn->prepare($cQuery);
        $change = ($type == 'PAYMENT') ? -$amount : $amount;
        $cStmt->bindParam(':a', $change);
        $cStmt->bindParam(':i', $id);
        $cStmt->execute();

        // Get new balance
        $bQuery = "SELECT debt FROM customers WHERE id = :i";
        $bStmt = $conn->prepare($bQuery);
        $bStmt->bindParam(':i', $id);
        $bStmt->execute();
        $newBalance = $bStmt->fetchColumn();

        // Log transaction
        $tQuery = "INSERT INTO customer_transactions (customer_id, type, amount, new_balance, details) 
                   VALUES (:i, :t, :a, :nb, :d)";
        $tStmt = $conn->prepare($tQuery);
        $tStmt->bindParam(':i', $id);
        $tStmt->bindParam(':t', $type);
        $tStmt->bindParam(':a', $amount);
        $tStmt->bindParam(':nb', $newBalance);
        $tStmt->bindParam(':d', $details);
        $tStmt->execute();

        $conn->commit();
        echo json_encode(["success" => true, "newBalance" => $newBalance]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

if ($action == 'delete') {
    $id = isset($_GET['id']) ? $_GET['id'] : '';
    $query = "DELETE FROM customers WHERE id = :i";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':i', $id);
    echo json_encode(["success" => $stmt->execute()]);
}
?>