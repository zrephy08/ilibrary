$(document).ready(function () {
    const CauthId = getCookie('auth_id');
    $.ajax({
        url: `https://ilibrary.zreky.muccs.host/back-end/api-author/v1/authors/${CauthId}`,
        //url: 'http://localhost/ilibrary/admin-side/back-end/api-author/v1/authors/${CauthId}',
        type: 'GET',
        success: function (response) {
            $('#auth_id').val(response[0].author_id);
            $('#fname').val(response[0].fname);
            $('#lname').val(response[0].lname);
            $('#bio').val(response[0].bio);
        },
        error: function (error) {
            console.error("Error:", error);
            alert("Error occurred while getting the author. Please try again.");
        }
    });

    $('#addAuthorForm').on('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Get form data
        const authId = $('#auth_id').val();
        const fname = $('#fname').val();
        const lname = $('#lname').val();
        const bio = $('#bio').val();

        // Prepare data for PUT request
        const formData = {
            auth_id: authId,
            fname: fname,
            lname: lname,
            bio: bio
        };

        // Send PUT request using AJAX
        $.ajax({
            url: `https://ilibrary.zreky.muccs.host/back-end/api-author/v1/authors/${CauthId}`,
            //url: 'http://localhost/ilibrary/admin-side/back-end/api-author/v1/authors/${CauthId}',
            type: 'PUT',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (response) {
                console.log(response);
                alert(response.msg);
                window.location.replace("authors.html");
            },
            error: function (xhr, status, error) {
                console.error("Error:", xhr);
                alert("Error occurred while updating author. Please try again.");
            }
        });
    });
});
