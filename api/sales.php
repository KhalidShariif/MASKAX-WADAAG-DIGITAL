<?php
require_once 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'list';

if ($action == 'list') {
    $start = isset($_GET['start']) ? $_GET['start'] : null;
    $end = isset($_GET['end']) ? $_GET['end'] : null;

    $query = "SELECT s.*, c.name as customer_name, u.username as cashier_name 
              FROM sales s 
              LEFT JOIN customers c ON s.customer_id = c.id 
              LEFT JOIN users u ON s.cashier_id = u.id";

    if ($start && $end) {
        $query .= " WHERE DATE(s.sale_date) BETWEEN :start AND :end";
    }

    $query .= " ORDER BY s.sale_date DESC";

    $stmt = $conn->prepare($query);
    if ($start && $end) {
        $stmt->bindParam(':start', $start);
        $stmt->bindParam(':end', $end);
    }
    $stmt->execute();
    $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch items for each sale
    foreach ($sales as &$sale) {
        $iQuery = "SELECT product_id as id, quantity, unit_price as price FROM sale_items WHERE sale_id = :sid";
        $iStmt = $conn->prepare($iQuery);
        $iStmt->bindParam(':sid', $sale['id']);
        $iStmt->execute();
        $sale['items'] = $iStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($sales);
}

if ($action == 'process') {
    $data = getJsonInput();

    try {
        $conn->beginTransaction();

        // 1. Create Sale Header
        $query = "INSERT INTO sales (total, payment_method, customer_id, cashier_id) 
                  VALUES (:t, :pm, :cid, :uid)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':t', $data['total']);
        $stmt->bindParam(':pm', $data['paymentMethod']);
        $stmt->bindParam(':cid', $data['customerId']);
        $stmt->bindParam(':uid', $data['cashierId']);
        $stmt->execute();
        $saleId = $conn->lastInsertId();

        // 2. Add Items & Update Stock
        foreach ($data['items'] as $item) {
            $iQuery = "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) 
                       VALUES (:sid, :pid, :q, :p)";
            $iStmt = $conn->prepare($iQuery);
            $iStmt->bindParam(':sid', $saleId);
            $iStmt->bindParam(':pid', $item['id']);
            $iStmt->bindParam(':q', $item['quantity']);
            $iStmt->bindParam(':p', $item['price']);
            $iStmt->execute();

            $sQuery = "UPDATE products SET stock = stock - :q WHERE id = :pid";
            $sStmt = $conn->prepare($sQuery);
            $sStmt->bindParam(':q', $item['quantity']);
            $sStmt->bindParam(':pid', $item['id']);
            $sStmt->execute();
        }

        // 3. Handle Customer History & Debt
        if ($data['customerId']) {
            $type = ($data['paymentMethod'] == 'debt') ? 'PURCHASE_DEBT' : 'PURCHASE_CASH';
            $details = "Sale #$saleId: " . implode(', ', array_map(function ($i) {
                return $i['quantity'] . 'x ' . $i['name'];
            }, $data['items']));

            if ($data['paymentMethod'] == 'debt') {
                $uQuery = "UPDATE customers SET debt = debt + :a WHERE id = :cid";
                $uStmt = $conn->prepare($uQuery);
                $uStmt->bindParam(':a', $data['total']);
                $uStmt->bindParam(':cid', $data['customerId']);
                $uStmt->execute();
            }

            // Get new balance
            $bQuery = "SELECT debt FROM customers WHERE id = :cid";
            $bStmt = $conn->prepare($bQuery);
            $bStmt->bindParam(':cid', $data['customerId']);
            $bStmt->execute();
            $newBalance = $bStmt->fetchColumn();

            $tQuery = "INSERT INTO customer_transactions (customer_id, type, amount, new_balance, details) 
                       VALUES (:cid, :t, :a, :nb, :d)";
            $tStmt = $conn->prepare($tQuery);
            $tStmt->bindParam(':cid', $data['customerId']);
            $tStmt->bindParam(':t', $type);
            $tStmt->bindParam(':a', $data['total']);
            $tStmt->bindParam(':nb', $newBalance);
            $tStmt->bindParam(':d', $details);
            $tStmt->execute();
        }

        $conn->commit();
        echo json_encode(["success" => true, "saleId" => $saleId]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
?>