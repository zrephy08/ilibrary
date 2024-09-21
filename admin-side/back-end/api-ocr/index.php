<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
header('Content-type: application/json');

// API version and entity
$api = "v1";
$entity = "subjects";

// Include database connection
include 'db_connection.php';

$method = $_SERVER['REQUEST_METHOD'];

// Validate the request URI
if (isset($_REQUEST['p'])) {
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);
    
    if ($uri[0] != $api || $cnt != 2 || $uri[1] != $entity) {
        http_response_code(400);
        echo json_encode(['msg' => 'Invalid request URI']);
        exit;
    }
} else {
    http_response_code(400);
    echo json_encode(['msg' => 'Missing parameter']);
    exit;
}

// Handle GET request
if ($method == 'GET') {
    $sql = "SELECT * FROM $entity";
    
    if ($result = mysqli_query($connection, $sql)) {
        $rowCount = mysqli_num_rows($result);
        
        if ($rowCount > 0) {
            $subjects = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $subjects[] = $row;
            }
            echo json_encode($subjects);
        } else {
            echo json_encode(['msg' => 'No subjects found!']);
        }
        
        mysqli_free_result($result);
    } else {
        http_response_code(500);
        echo json_encode(['msg' => 'Database query error']);
    }
} else {
    http_response_code(400);
    echo json_encode(['msg' => 'Invalid request method']);
}

mysqli_close($connection);
?>
