<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
header('Content-type: application/json');

$api = "v1";
$entity = "authors";

include '../db_connection.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);
    if ($cnt == 2 && $uri[0] == $api && $uri[1] == $entity) {

        $fname = $_POST['fname'];
        $lname = $_POST['lname'];
        $bio = $_POST['bio'];

        // Prepare the SQL insert statement
        $query = "INSERT INTO $entity (fname, lname, bio) VALUES ('$fname', '$lname','$bio')";
        
        if (mysqli_query($connection, $query)) {
            // Successful insertion
            $response = [
                'msg' => 'Author added successfully.',
            ];
            http_response_code(201); // Server task fulfilled
        } else {
            // Database error
            $response = [
                'msg' => 'Error inserting user: ' . mysqli_error($connection)
            ];
            http_response_code(500); // Internal Server Error
        }
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

        // Prepare SQL query to select all author
        $query = "SELECT * FROM $entity WHERE deleted = '0'";
        
        $result = mysqli_query($connection, $query);
        
        if ($result) {
            $authors = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $authors[] = [
                    'author_id' => $row['author_id'],
                    'fname' => $row['fname'],
                    'lname' => $row['lname'],
                    'bio' => $row['bio'],
                ];
            }

            // Send the authors as a JSON response
            echo json_encode($authors);
            http_response_code(200); // OK
        } else {
            // Database error
            $response = [
                'msg' => 'Error fetching authors: ' . mysqli_error($connection)
            ];
            echo json_encode($response);
            http_response_code(500); // Internal Server Error
        }
    }else if ($cnt == 3 && $uri[0] == $api && $uri[1] == $entity){
        $pubId = $uri[2];
        $query = "SELECT * FROM $entity WHERE author_id = $pubId and deleted = '0'";
        
        $result = mysqli_query($connection, $query);
        
        if ($result) {
            $authors = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $authors[] = [
                    'author_id' => $row['author_id'],
                    'fname' => $row['fname'],
                    'lname' => $row['lname'],
                    'bio' => $row['bio'],
                ];
            }

            // Send the authors as a JSON response
            echo json_encode($authors);
            http_response_code(200); // OK
        } else {
            // Database error
            $response = [
                'msg' => 'Error fetching authors: ' . mysqli_error($connection)
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
