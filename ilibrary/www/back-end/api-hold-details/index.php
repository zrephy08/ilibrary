<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
header('Content-type: application/json');

$api = "v1";
$entity = "holdings";

include '../db_connection.php';

$method = $_SERVER['REQUEST_METHOD'];

if($method == 'GET'){
    $param = $_REQUEST['p'];
    $param = rtrim($param, "/");
    $uri = explode('/', $param);
    $cnt = count($uri);
    
    if ($cnt == 2 && $uri[0] == $api && $uri[1] == $entity) {
        // Fill in if needed
        $response = [
            'msg' => 'No task for this condition.'
        ];
        echo json_encode($response);
        http_response_code(200);

    } else if ($cnt == 3 && $uri[0] == $api && $uri[1] == $entity){
        $holdId = $uri[2];
        $query = "SELECT * FROM $entity WHERE holdId = $holdId AND deleted = '0'";

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
