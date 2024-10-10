$(document).ready(function () {
    // Handle delete button click
    $('#publisher-table').on('click', '.delete-btn[data-id]', function () {
        const pubId = $(this).data('id'); // Get the subject ID from the data attribute
        
        if (confirm("Are you sure you want to delete this publisher?")) {
            // Send AJAX DELETE request
            $.ajax({
                url: `https://ilibrary.zreky.muccs.host/back-end/api-publisher/v1/publishers/${pubId}`,
                //url: 'http://localhost/ilibrary/admin-side/back-end/api-publisher/v1/publishers/${pubId}',
                type: 'DELETE',
                success: function (response) {
                    alert(response.msg);
                    window.location.replace("publisher.html");
                },
                error: function (xhr, status, error) {
                    console.error("Error:", xhr);
                    alert('Error occurred while deleting subject. Please try again.');
                }
            });
        }
    });
});
