$(document).ready(function(){
    $("#addPublisherForm").submit(function(event){
        event.preventDefault();

        // Get form data
        var formData = {
            pub_name: $("#pub_name").val(),
            pub_address: $("#pub_address").val(),
            contact_num: $("#contact_num").val(),
            email: $("#email").val(),
        };

        // Send POST request
        $.ajax({
            url: "http://localhost/ilibrary/admin-side/back-end/api-publisher/v1/publishers", // Ensure the URL is correct
            type: "POST",
            data: formData,
            dataType: "json",
            success: function(response){
                alert(response.msg);
                window.location.replace("publisher.html");
            },
            error: function(xhr, status, error){
                console.error("Error:", error);
                alert("Error occurred while adding subject. Please try again.");
            }
        });
    });
});