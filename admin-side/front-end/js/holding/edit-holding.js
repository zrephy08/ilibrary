$(document).ready(function () {
    const CholdId = getCookie('hold_id'); // Use quotes for the cookie name
    let tagify;
    $.ajax({
        url: `http://localhost/ilibrary/admin-side/back-end/api-holding/v1/holdings/${CholdId}`,
        type: 'GET',
        success: function (response) {
            // Populate the form fields with the retrieved subject data
            $('#holding_id').val(response[0].hold_id);
            $('#title').val(response[0].title);
            $('#isbn').val(response[0].isbn);
            $('#edition').val(response[0].edition);
            $('#acs_num').val(response[0].accss_num);
            $('#shlf_num').val(response[0].shelf_num);
            $('#pub_date').val(response[0].published_date);
            $('#format').val(response[0].format);
            $('#copies').val(response[0].copies);
            $('#av_copies').val(response[0].av_copies);

            setTimeout(function () {
                $('#auth').val(response[0].author_id);
                $('#pub').val(response[0].pub_id);
            }, 100);

            const subjectsInput = document.querySelector('#subjects');
            if (!subjectsInput.hasOwnProperty('__tagify')) {
                let subjects = JSON.parse(response[0].subjects); // Parse the JSON string if needed
                tagify = new Tagify(subjectsInput, {
                    whitelist: subjects
                });

                // Add the tags
                tagify.addTags(subjects);
            } else {
                // Use the existing Tagify instance
                tagify = subjectsInput.__tagify;
                let subjects = JSON.parse(response[0].subjects);
                tagify.removeAllTags(); // Clear any previous tags
                tagify.addTags(subjects); // Add new tags
            }
        },
        error: function (error) {
            console.error("Error:", error);
            alert("Error occurred while getting the subject. Please try again.");
        }
    });

    $('#addHoldingForm').on('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission
        
        // Get form data
        const holdId = $('#holding_id').val();
        const title = $('#title').val();
        const isbn = $('#isbn').val();
        const edition = $('#edition').val();
        const acsNum = $('#acs_num').val();
        const shlfNum = $('#shlf_num').val();
        const pubDate = $('#pub_date').val();
        const auth = $('#auth').val();
        const format = $('#format').val();
        const copies = $('#copies').val();
        const avCopies = $('#av_copies').val();
        const pub = $('#pub').val();
        const subs = tagify.value;

        // Prepare data for PUT request
        const formData = {
            hold_id: holdId,
            title: title,
            isbn: isbn,
            edition: edition,
            accss_num: acsNum, 
            shelf_num: shlfNum,
            published_date: pubDate,
            author_id: auth,
            format: format,
            copies: copies,
            av_copies: avCopies,
            pub_id: pub,
            subjects: JSON.stringify(subs)
        };

        // Send PUT request using AJAX
        $.ajax({
            url: `http://localhost/ilibrary/admin-side/back-end/api-holding/v1/holdings/${CholdId}`,
            type: 'PUT',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (response) {
                console.log(response);
                alert(response.msg);
                window.location.replace("holdings.html");
            },
            error: function (xhr, status, error) {
                console.error("Error:", xhr);
                alert("Error occurred while updating subject. Please try again.");
            }
        });
    });
});
