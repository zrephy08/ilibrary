$(document).ready(function () {
    const CpubId = getCookie('pub_id'); // Use quotes for the cookie name
    $.ajax({
        url: `https://ilibrary.zreky.muccs.host/back-end/api-publisher/v1/publishers/${CpubId}`,
        //url: 'http://localhost/ilibrary/admin-side/back-end/api-publisher/v1/publishers/${CpubId}',
        type: 'GET',
        success: function (response) {
            $('#pub_id').val(response[0].pubId);
            $('#pub_name').val(response[0].pubName);
            $('#pub_address').val(response[0].pubAddress);
            $('#contact_num').val(response[0].contactNum);
            $('#email').val(response[0].email);
        },
        error: function (error) {
            console.error("Error:", error);
            alert("Error occurred while getting the publisher. Please try again.");
        }
    });

    $('#addPublisherForm').on('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Get form data
        const pubId = $('#pub_id').val();
        const pubname = $('#pub_name').val();
        const pubadd = $('#pub_address').val();
        const contactnum = $('#contact_num').val();
        const email = $('#email').val();

        // Prepare data for PUT request
        const formData = {
            pub_Id: pubId,
            pub_name: pubname,
            pub_add: pubadd,
            contact_num: contactnum,
            email: email
        };

        // Send PUT request using AJAX
        $.ajax({
            url: `https://ilibrary.zreky.muccs.host/back-end/api-publisher/v1/publishers/${CpubId}`,
            //url: 'http://localhost/ilibrary/admin-side/back-end/api-publisher/v1/publishers/${CpubId}',
            type: 'PUT',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (response) {
                console.log(response);
                alert(response.msg);
                window.location.replace("publisher.html");
            },
            error: function (xhr, status, error) {
                console.error("Error:", xhr);
                alert("Error occurred while updating subject. Please try again.");
            }
        });
    });
});
