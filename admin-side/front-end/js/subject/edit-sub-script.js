$(document).ready(function () {
    const CsubId = getCookie('sub_id'); // Use quotes for the cookie name
    $.ajax({
        url: `http://localhost/ilibrary/admin-side/back-end/api-subject/v1/subjects/${CsubId}`,
        type: 'GET',
        success: function (response) {
            // Populate the form fields with the retrieved subject data
            $('#sub_id').val(response[0].sub_id); // Assuming the response has these fields
            $('#subname').val(response[0].sub_name);
            $('#subdesc').val(response[0].sub_desc);
        },
        error: function (error) {
            console.error("Error:", error);
            alert("Error occurred while getting the subject. Please try again.");
        }
    });

    $('#addSubjectForm').on('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Get form data
        const subId = $('#sub_id').val();
        const subName = $('#subname').val();
        const subDesc = $('#subdesc').val();

        // Prepare data for PUT request
        const formData = {
            sub_id: subId,
            subname: subName,
            subdesc: subDesc
        };

        // Send PUT request using AJAX
        $.ajax({
            url: `http://localhost/ilibrary/admin-side/back-end/api-subject/v1/subjects/${CsubId}`,
            type: 'PUT',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (response) {
                console.log(response);
                alert(response.msg);
                window.location.replace("subjects.html");
            },
            error: function (xhr, status, error) {
                console.error("Error:", xhr);
                alert("Error occurred while updating subject. Please try again.");
            }
        });
    });
});
