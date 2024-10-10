<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
header('Content-type: application/json');

$api = "v1";
$entity = "subjects";

include '../db_connection.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);
    if ($cnt == 2 && $uri[0] == $api && $uri[1] == $entity) {

        $subname = $_POST['subname'];
        $subdesc = $_POST['subdesc'];

        // Prepare the SQL insert statement
        $query = "INSERT INTO $entity (sub_name, sub_desc) VALUES ('$subname', '$subdesc')";
        
        if (mysqli_query($connection, $query)) {
            // Successful insertion
            $response = [
                'msg' => 'Subject added successfully.',
            ];
            http_response_code(201); // Created
        } else {
            // Database error
            $response = [
                'msg' => 'Error inserting subject: ' . mysqli_error($connection)
            ];
            http_response_code(500); // Internal Server Error
        }
        echo json_encode($response);
    } else {
        // Invalid request
        $response = [
            'msg' => 'Invalid request.'
        ];
        http_response_code(400); // Bad Request
    }
} else if($method == 'GET'){
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);
    
    if ($cnt == 2 && $uri[0] == $api && $uri[1] == $entity) {
        // Prepare SQL query to select all subjects
        $query = "SELECT sub_id, sub_name, sub_desc FROM $entity WHERE deleted = '0'";
        
        $result = mysqli_query($connection, $query);
        
        if ($result) {
            $subjects = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $subjects[] = [
                    'sub_id' => $row['sub_id'],
                    'sub_name' => $row['sub_name'],
                    'sub_desc' => $row['sub_desc']
                ];
            }

            // Send the subjects as a JSON response
            echo json_encode($subjects);
            http_response_code(200); // OK
        } else {
            // Database error
            $response = [
                'msg' => 'Error fetching subjects: ' . mysqli_error($connection)
            ];
            echo json_encode($response);
            http_response_code(500); // Internal Server Error
        }
    } else if ($cnt == 3 && $uri[0] == $api && $uri[1] == $entity){
        $subId = $uri[2];
        $query = "SELECT * FROM $entity WHERE sub_id = $subId and deleted = '0'";
        
        $result = mysqli_query($connection, $query);
        
        if ($result) {
            $subjects = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $subjects[] = [
                    'sub_id' => $row['sub_id'],
                    'sub_name' => $row['sub_name'],
                    'sub_desc' => $row['sub_desc']
                ];
            }

            // Send the subjects as a JSON response
            echo json_encode($subjects);
            http_response_code(200); // OK
        } else {
            // Database error
            $response = [
                'msg' => 'Error fetching subjects: ' . mysqli_error($connection)
            ];
            echo json_encode($response);
            http_response_code(500); // Internal Server Error
        }
    } else {
        // Invalid request
        $response = [
            'msg' => 'Invalid request.'
        ];
        echo json_encode($response);
        http_response_code(400); // Bad Request
    }
} else if ($method == 'PUT') {
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);

    if ($cnt == 3 && $uri[0] == $api && $uri[1] == $entity) {
        // Get the subject ID from the URL
        $sub_id = $uri[2];

        $json = file_get_contents('php://input');
        $_PUT = json_decode($json, true);

        $subId = $_PUT['sub_id'];
        $subname = $_PUT['subname'];
        $subdesc = $_PUT['subdesc'];

        // Prepare the SQL update statement
        $query = "UPDATE $entity SET sub_id = '$subId', sub_name = '$subname', sub_desc = '$subdesc' WHERE sub_id = '$sub_id'";
        
        if (mysqli_query($connection, $query)) {
            // Successful insertion
            $response = [
                'msg' => 'Subject updated successfully.',
            ];
            file_put_contents('test.txt', 'worked');
            http_response_code(201); // Created
        } else {
            // Database error
            $response = [
                'msg' => 'Error updating subject: ' . mysqli_error($connection)
            ];
            http_response_code(500); // Internal Server Error
        }
    } else {
        $response = ['msg' => 'Invalid request.'];
        http_response_code(400); // Bad Request
    }
    echo json_encode($response);
} else if ($method == 'DELETE') {
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);

    if ($cnt == 3 && $uri[0] == $api && $uri[1] == $entity) {
        $subId = $uri[2];

        $query = "UPDATE $entity SET deleted = '1' WHERE sub_id = '$subId'";

        if (mysqli_query($connection, $query)) {
            // Successful deletion
            $response = [
                'msg' => 'Subject deleted successfully.',
            ];
            http_response_code(201); // Created
        } else {
            // Database error
            $response = [
                'msg' => 'Error deleting subject: ' . mysqli_error($connection)
            ];
            http_response_code(500); // Internal Server Error
        }
        echo json_encode($response);
    }
} else {
    // Invalid method
    $response = [
        'msg' => 'Invalid method.'
    ];
    echo json_encode($response);
    http_response_code(405); // Method Not Allowed
}

// Close the database connection
mysqli_close($connection);
?>
