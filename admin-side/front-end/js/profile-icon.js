$(document).ready(function(){
    const CadminId = getCookie('cookie-adminId');
    let imagePath = `https://ilibrary.zreky.muccs.host/front-end/images/${CadminId}.jpg?${new Date().getTime()}`;

    checkImageUrl(imagePath, function(isValid) {
        if (!isValid) {
            // If the image doesn't load, you can set a default image or handle the error
            document.getElementById('profile-icon').src = 'https://ilibrary.zreky.muccs.host/front-end/css/img/0.png';
        } else {
            document.getElementById('profile-icon').src = imagePath;
        }
    });

    $('#profile-icon-link').click(function (event) {
        event.preventDefault(); // Prevent the default anchor behavior
        $('#profile-dropdown').toggle(); // Toggle the dropdown menu
    });

    // Optionally, hide the dropdown if clicked outside
    $(document).click(function (event) {
        if (!$(event.target).closest('#profile-icon-link, #profile-dropdown').length) {
            $('#profile-dropdown').hide(); // Hide if clicking outside
        }
    });


    $('#logout').click(function (event) {
        event.preventDefault(); // Prevent the default anchor behavior
            // Function to delete all cookies
        function deleteAllCookies() {
            const cookies = document.cookie.split(";");

            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                // Set the cookie's expiration date to the past
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }
        }

        deleteAllCookies(); // Call the function to delete cookies
        window.location.replace('../index.html'); // Redirect to index.html
    });

    function checkImageUrl(url, callback) {
        const img = new Image();
        img.onload = function() {
            callback(true);
        };
        img.onerror = function() {
            callback(false);
        };
        img.src = url;
    }
});