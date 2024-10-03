$(document).ready(function () {
    // Initialize Tagify on the subjects input field
    var input = document.querySelector('#subjects');
    var tagify = new Tagify(input);

    // Function to load subjects from the database
    function loadSubjects() {
        $.ajax({
            url: 'http://localhost/ilibrary/admin-side/back-end/api-subject/v1/subjects',  // Your API endpoint to get subjects
            method: 'GET',
            success: function (data) {
                // Assuming the response is an array of subjects
                let subjects = data.map(subject => ({ value: subject.sub_name, id: subject.sub_id }));
                
                // Set the suggestions for Tagify
                tagify.settings.whitelist = subjects;
            },
            error: function (xhr, status, error) {
                console.log('Error fetching subjects: ', error);
            }
        });
    }

    // Call the function to load subjects
    loadSubjects();
});
