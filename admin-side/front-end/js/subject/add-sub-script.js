$(document).ready(function(){
    $("#addSubjectForm").submit(function(event){
        event.preventDefault();

        // Get form data
        var formData = {
            subname: $("#subname").val(),
            subdesc: $("#subdesc").val(),
        };

        // Send POST request
        $.ajax({
            url: 'https://ilibrary.zreky.muccs.host/back-end/api-subject/v1/subjects',
            //url: "http://localhost/ilibrary/admin-side/back-end/api-subject/v1/subjects", // Ensure the URL is correct
            type: "POST",
            data: formData,
            dataType: "json",
            success: function(response){
                alert(response.msg);
                window.location.replace("subjects.html");
            },
            error: function(error){
                console.error("Error:", error);
                alert("Error occurred while adding subject. Please try again.");
            }
        });
    });
});