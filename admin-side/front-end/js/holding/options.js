$(document).ready(function () {

    // Function to fetch authors and populate the select dropdown
    function fetchAuthors() {
        $.ajax({
            url: `https://ilibrary.zreky.muccs.host/back-end/api-author/v1/authors`,
            //url: 'http://localhost/ilibrary/admin-side/back-end/api-author/v1/authors',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                const authorSelect = $('#auth');

                authorSelect.empty();
                authorSelect.append('<option value="">Select Author</option>');

                // Populate authors
                $.each(data, function (index, author) {
                    authorSelect.append('<option value="' + author.author_id + '">' + author.fname + ' ' + author.lname + '</option>');
                });

            },
            error: function (error) {
                console.error('Error fetching author data:', error);
            }
        });
    }

    // Function to fetch publishers and populate the select dropdown
    function fetchPublishers() {
        $.ajax({
            url: `https://ilibrary.zreky.muccs.host/back-end/api-publisher/v1/publishers`,
            //url: 'http://localhost/ilibrary/admin-side/back-end/api-publisher/v1/publishers',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                const publisherSelect = $('#pub');

                publisherSelect.empty(); // Clear existing options
                publisherSelect.append('<option value="">Select Publisher</option>');

                // Populate publishers
                $.each(data, function (index, publisher) {
                    publisherSelect.append('<option value="' + publisher.pub_id + '">' + publisher.pub_name + '</option>');
                });

            },
            error: function (error) {
                console.error('Error fetching publisher data:', error);
            }
        });
    }

    // Initial function calls to fetch authors and publishers
    fetchAuthors();
    fetchPublishers();
});
