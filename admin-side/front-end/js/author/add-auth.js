$(document).ready(function(){
    $("#addAuthorForm").submit(function(event){
        event.preventDefault();

        // Get form data
        var formData = {
            fname: $("#fname").val(),
            lname: $("#lname").val(),
            bio: $("#bio").val(),
        };

        // Send POST request
        $.ajax({
            url: `https://ilibrary.zreky.muccs.host/back-end/api-author/v1/authors`,
            //url: 'http://localhost/ilibrary/admin-side/back-end/api-author/v1/authors',
            type: "POST",
            data: formData,
            dataType: "json",
            success: function(response){
                alert(response.msg);
                window.location.replace("authors.html");
            },
            error: function(xhr, status, error){
                console.error("Error:", error);
                alert("Error occurred while adding subject. Please try again.");
            }
        });
    });
});