$(document).ready(function() {
    // Initialize Tagify for subjects
    var input = document.querySelector('input[name=subjects]');
    new Tagify(input);

    // Submit form via AJAX
    $('#addHoldingForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Gather form data
        var formData = {
            title: $('#title').val(),
            isbn: $('#isbn').val(),
            edition: $('#edition').val(),
            acs_num: $('#acs_num').val(),
            shlf_num: $('#shlf_num').val(),
            pub_date: $('#pub_date').val(),
            author: $('#auth').val(),
            format: $('#format').val(),
            copies: $('#copies').val(),
            av_copies: $('#av_copies').val(),
            publisher: $('#pub').val(),
            subjects: $('input[name="subjects"]').val() // Tagify field
        };

        // Send AJAX request
        $.ajax({
            url: 'http://localhost/ilibrary/admin-side/back-end/api-holding/v1/holdings', // Change to your API endpoint or PHP script path
            type: "POST",
            data: formData,
            dataType: "json",
            success: function(response) {
                alert('Holding added successfully!');
                window.location.replace("holdings.html");
            },
            error: function(xhr, status, error) {
                console.error('Error occurred:', xhr, status, error);
                alert('An error occurred while adding the holding.');
            }
        });
    });
});
