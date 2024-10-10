$(document).ready(function () {
    // Handle delete button click
    $('#subject-table').on('click', '.delete-btn[data-id]', function () {

        const subId = $(this).data('id'); // Get the subject ID from the data attribute
        
        if (confirm("Are you sure you want to delete this subject?")) {
            // Send AJAX DELETE request
            $.ajax({
                url: `https://ilibrary.zreky.muccs.host/back-end/api-subject/v1/subjects/${subId}`,
                //url: `http://localhost/ilibrary/admin-side/back-end/api-subject/v1/subjects/${subId}`,
                type: 'DELETE',
                success: function (response) {
                    console.log(response);
                    alert(response.msg);
                    window.location.replace("subjects.html");
                },
                error: function (xhr, status, error) {
                    console.error("Error:", xhr);
                    alert('Error occurred while deleting subject. Please try again.');
                }
            });
        }
    });
});
