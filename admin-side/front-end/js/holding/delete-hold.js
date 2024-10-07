$(document).ready(function () {
    // Handle delete button click
    $('#holding-table').on('click', '.delete-btn[data-id]', function () {

        const holdId = $(this).data('id'); // Get the subject ID from the data attribute
        
        if (confirm("Are you sure you want to delete this holding?")) {
            // Send AJAX DELETE request
            $.ajax({
                url: `http://localhost/ilibrary/admin-side/back-end/api-holding/v1/holdings/${holdId}`,
                type: 'DELETE',
                success: function (response) {
                    console.log(response);
                    alert(response.msg);
                    window.location.replace("holdings.html");
                },
                error: function (xhr, status, error) {
                    console.error("Error:", xhr);
                    alert('Error occurred while deleting subject. Please try again.');
                }
            });
        }
    });
});
