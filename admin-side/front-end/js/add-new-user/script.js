$(document).ready(function(){
    $("#addUserForm").submit(function(event){
        event.preventDefault();

        // Get form data
        var formData = {
            idnum: $("#idnum").val(),
            fname: $("#fname").val(),
            lname: $("#lname").val(),
            email: $("#email").val(),
            password: $("#password").val()
        };

        // Send POST request
        $.ajax({
            url: "http://localhost/ilibrary/admin-side/back-end/api-user/v1/admin_acc", // Ensure the URL is correct
            type: "POST",
            data: formData,
            dataType: "json",
            success: function(response){
                alert(response.msg);
                window.location.replace("users.html");
            },
            error: function(xhr, status, error){
                console.error("Error:", error);
                alert("Error occurred while adding user. Please try again.");
            }
        });
    });
});