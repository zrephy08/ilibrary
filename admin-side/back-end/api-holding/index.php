<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
header('Content-type: application/json');

$api = "v1";
$entity = "holdings";

include '../db_connection.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);
    if ($cnt == 2 && $uri[0] == $api && $uri[1] == $entity) {

        $title = $_POST['title'];
        $isbn = $_POST['isbn'];
        $edition = $_POST['edition'];
        $acs_num = $_POST['acs_num'];
        $shlf_num = $_POST['shlf_num'];
        $pub_date = $_POST['pub_date'];
        $auth = $_POST['author'];
        $format = $_POST['format'];
        $copies = $_POST['copies'];
        $av_copies = $_POST['av_copies'];
        $pub = $_POST['publisher'];
        $subjects = $_POST['subjects'];

        // Prepare the SQL insert statement for holding
        $query = "INSERT INTO $entity (title, isbn, edition, accss_num, shelf_num, published_date, author_id, format, copies, av_copies, pub_id, subjects) 
                  VALUES ('$title', '$isbn', '$edition', '$acs_num', '$shlf_num', '$pub_date', '$auth', '$format', '$copies', '$av_copies', '$pub', '$subjects')";
        
        if (mysqli_query($connection, $query)) {
            // Successful insertion
            $response = [
                'msg' => 'Holding added successfully.',
            ];
            http_response_code(201); // Created
        } else {
            // Database error
            $response = [
                'msg' => 'Error inserting holding: ' . mysqli_error($connection)
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
        // Prepare SQL query to select all subjects
        $query = "SELECT * FROM $entity WHERE deleted = '0'";
        
        $result = mysqli_query($connection, $query);
        
        if ($result) {
            $holding = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $holding[] = [
                    'hold_id' => $row['hold_id'],
                    'title' => $row['title'],
                    'isbn' => $row['isbn'],
                    'edition' => $row['edition'],
                    'accss_num' => $row['accss_num'],
                    'shelf_num' => $row['shelf_num'],
                    'published_date' => $row['published_date'],
                    'author_id' => $row['author_id'],
                    'format' => $row['format'],
                    'copies' => $row['copies'],
                    'av_copies' => $row['av_copies'],
                    'pub_id' => $row['pub_id'],
                    'subjects' => $row['subjects']
                ];
            }

            // Send the holding as a JSON response
            echo json_encode($holding);
            http_response_code(200); // OK
        } else {
            // Database error
            $response = [
                'msg' => 'Error fetching holding: ' . mysqli_error($connection)
            ];
            echo json_encode($response);
            http_response_code(500); // Internal Server Error
        }
    } else if ($cnt == 3 && $uri[0] == $api && $uri[1] == $entity){
        $holdId = $uri[2];
        $query = "SELECT * FROM $entity WHERE hold_id = $holdId and deleted = '0'";
        
        $result = mysqli_query($connection, $query);
        
        if ($result) {
            $subjects = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $subjects[] = [
                    'hold_id' => $row['hold_id'],
                    'title' => $row['title'],
                    'isbn' => $row['isbn'],
                    'edition' => $row['edition'],
                    'accss_num' => $row['accss_num'],
                    'shelf_num' => $row['shelf_num'],
                    'published_date' => $row['published_date'],
                    'author_id' => $row['author_id'],
                    'format' => $row['format'],
                    'copies' => $row['copies'],
                    'av_copies' => $row['av_copies'],
                    'pub_id' => $row['pub_id'],
                    'subjects' => $row['subjects']
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
        $hold_id = $uri[2];

        $json = file_get_contents('php://input');

        // Decode the JSON to an associative array
        $_PUT = json_decode($json , true);

        $holdId = $_PUT['hold_id'];
        $title = $_PUT['title'];
        $isbn = $_PUT['isbn'];
        $edition = $_PUT['edition'];
        $accssNum = $_PUT['accss_num'];
        $shlfNum = $_PUT['shelf_num'];
        $pubDate = $_PUT['published_date'];
        $authId = $_PUT['author_id'];
        $format = $_PUT['format'];
        $copies = $_PUT['copies'];
        $avCopies = $_PUT['av_copies'];
        $pubId = $_PUT['pub_id'];
        $subjects = $_PUT['subjects'];
        
        // Prepare the SQL update query
        $query = "UPDATE $entity SET 
                    title = '$title', 
                    isbn = '$isbn', 
                    edition = '$edition', 
                    accss_num = '$accssNum', 
                    shelf_num = '$shlfNum', 
                    published_date = '$pubDate', 
                    author_id = '$authId', 
                    format = '$format', 
                    copies = '$copies', 
                    av_copies = '$avCopies', 
                    pub_id = '$pubId', 
                    subjects = '$subjects'
                  WHERE hold_id = '$hold_id'";

        // Execute the query
        if (mysqli_query($connection, $query)) {
            // Successful update
            $response = [
                'msg' => 'Holding updated successfully.'
            ];
            echo json_encode($response);
            http_response_code(200); // OK
        } else {
            // Database error
            $response = [
                'msg' => 'Error updating holding: ' . mysqli_error($connection)
            ];
            echo json_encode($response);
            http_response_code(500); // Internal Server Error
        }
    } else {
        $response = ['msg' => 'Invalid request.'];
        echo json_encode($response);
        http_response_code(400); // Bad Request
    }
} else if ($method == 'DELETE') {
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);

    if ($cnt == 3 && $uri[0] == $api && $uri[1] == $entity) {
        $holdId = $uri[2];

        $query = "UPDATE $entity SET deleted = '1' WHERE hold_id = '$holdId'";

        if (mysqli_query($connection, $query)) {
            // Successful deletion
            $response = [
                'msg' => 'Holding deleted successfully.',
            ];
            http_response_code(201); // Created
        } else {
            // Database error
            $response = [
                'msg' => 'Error deleting holding: ' . mysqli_error($connection)
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
