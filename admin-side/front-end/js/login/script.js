$(document).ready(function(){
    $("#loginForm").submit(function(event){
        event.preventDefault();

        // Get form data
        var formData = {
            idnum: $("#idnum").val(),
            password: $("#password").val()
        };

        // Send POST request
        $.ajax({
            url: "http://localhost/ilibrary/admin-side/back-end/api-login/v1/admin_acc", // Ensure the URL is correct
            type: "POST",
            data: formData,
            dataType: "json",
            success: function(response){
                console.log("Response:", response);
                if(response.msg === 'Login successful'){
                    setCookie("cookie_admin_id", response.admin_id, 7);
                    alert("Login successful!");
                    window.location.replace('front-end/dashboard.html');
                } else {
                    // Handle login failure
                    alert(response.msg);
                }
            },
            error: function(xhr, status, error){
                console.error("Error:", error);
                alert("Error occurred while logging in. Please try again.");
            }
        });
    });
});