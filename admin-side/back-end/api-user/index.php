<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
header('Content-type: application/json');

$api = "v1";
$entity = "admin_acc";

include '../db_connection.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);
    if ($cnt == 2 && $uri[0] == $api && $uri[1] == $entity) {

        // Retrieve username and password from POST data
        $idnum = $_POST['idnum'];
        $fname = $_POST['fname'];
        $lname = $_POST['lname'];
        $email = $_POST['email'];
        $password = $_POST['password'];

        // Hash the password for security
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Prepare the SQL insert statement
        $query = "INSERT INTO $entity (admin_id, fname, lname, email, password) VALUES ('$idnum', '$fname', '$lname', '$email', '$hashed_password')";
        
        if (mysqli_query($connection, $query)) {
            // Successful insertion
            $response = [
                'msg' => 'User added successfully.',
                'idnum' => $idnum
            ];
            http_response_code(201); // Created
        } else {
            // Database error
            $response = [
                'msg' => 'Error inserting user: ' . mysqli_error($connection)
            ];
            http_response_code(500); // Internal Server Error
        }
        echo json_encode($response);
    } else {
        // Invalid request
        $response = [
            'msg' => 'Invalid request.'
        ];
        echo json_encode($response);
        http_response_code(400); // Bad Request
    }
} else if($method == 'GET'){
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);
    
    if ($cnt == 2 && $uri[0] == $api && $uri[1] == $entity) {

        $query = "SELECT * FROM $entity WHERE deleted = '0'";
        
        $result = mysqli_query($connection, $query);
        
        if ($result) {
            $users = array();
            while ($row = mysqli_fetch_assoc($result)) {
                $users[] = $row;
            }
            echo json_encode($users);
            http_response_code(200); // OK
        } else {
            $response = [
                'msg' => 'Error fetching users: ' . mysqli_error($connection)
            ];
            echo json_encode($response);
            http_response_code(500); // Internal Server Error
        }
    }
} else {
    // Invalid method
    $response = [
        'msg' => 'Invalid method.'
    ];
    http_response_code(405); // Method Not Allowed
}

// Return the JSON response
echo json_encode($response);

// Close the database connection
mysqli_close($connection);
?>
