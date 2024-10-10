$(document).ready(function(){
    $("#addUserForm").submit(function(event){
        event.preventDefault();

        var formData = {
            idnum: $("#idnum").val(),
            fname: $("#fname").val(),
            lname: $("#lname").val(),
            email: $("#email").val(),
            password: $("#password").val()
        };

        $.ajax({
            url: `https://ilibrary.zreky.muccs.host/back-end/api-user/v1/admin_acc`,
            //url: "http://localhost/ilibrary/admin-side/back-end/api-user/v1/admin_acc",
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