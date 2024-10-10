$(document).ready(function () {
    // Handle delete button click
    $('#author-table').on('click', '.delete-btn[data-id]', function () {
        const authId = $(this).data('id'); // Get the subject ID from the data attribute
        
        if (confirm("Are you sure you want to delete this author?")) {
            // Send AJAX DELETE request
            $.ajax({
                url: `https://ilibrary.zreky.muccs.host/back-end/api-author/v1/authors/${authId}`,
                //url: 'http://localhost/ilibrary/admin-side/back-end/api-author/v1/authors/${authId}',
                type: 'DELETE',
                success: function (response) {
                    alert(response.msg);
                    window.location.replace("authors.html");
                },
                error: function (xhr, status, error) {
                    console.error("Error:", xhr);
                    alert('Error occurred while deleting author. Please try again.');
                }
            });
        }
    });
});
