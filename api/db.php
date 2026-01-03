<?php
/**
 * Database Connection Configuration
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

$host = 'localhost';
$db_name = 'shop_master';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $exception) {
    echo json_encode(["success" => false, "message" => "Connection error: " . $exception->getMessage()]);
    exit();
}

/**
 * Helper to get JSON input
 */
function getJsonInput() {
    return json_decode(file_get_contents("php://input"), true);
}
?>
