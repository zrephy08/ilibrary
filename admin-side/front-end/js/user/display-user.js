$(document).ready(function () {
    let currentPage = 1;
    const rowsPerPage = 5; // Number of rows per page
    let usersData = [];

    // AJAX request to get subjects from the API
    $.ajax({
        url: `https://ilibrary.zreky.muccs.host/back-end/api-user/v1/admin_acc`,
        //url: 'http://localhost/ilibrary/admin-side/back-end/api-user/v1/admin_acc',
        type: 'GET',
        success: function (data) {
            usersData = data;
            displayUsers(currentPage);
            setupPagination(usersData.length);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching users:', error);
        }
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

    // Function to display subjects on the current page
    function displayUsers(page) {
        $('#users-table tbody').empty();
        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let usersToShow = usersData.slice(start, end);

        $.each(usersToShow, function (index, user) {

            let imageUrl = `https://irecipe.zreky.muccs.host/back-end/uploads/profile-pic/${user.id}.jpg?${new Date().getTime()}`;

            checkImageUrl(imageUrl, function(isValid) {
                if (isValid) {
                    let imageUrl = `https://ilibrary.zreky.muccs.host/front-end/img/${user.id}.jpg?${new Date().getTime()}`;

                    $('#users-table tbody').append(
                        '<td>'+
                            '<img id="profile-pic" src="'+ imageUrl +'">' +
                        '</td>' +
                        '<td>' + user.admin_id + '</td>' +
                        '<td>' + user.fname + ' ' + user.lname + '</td>' +
                        '<td>' + user.email + '</td>' +
                        '<td>' + user.status + '</td>' +
                        '<td>' +
                            '<a href="#" class="action-btn edit-btn" data-id="' + user.admin_id + '" title="Edit">' +
                                '<i class="bi bi-pencil-fill"></i>' +
                            '</a> ' +
                            '<a href="#" class="action-btn delete-btn" data-id="' + user.admin_id + '" title="Delete">' +
                                '<i class="bi bi-trash-fill"></i>' +
                            '</a>' +
                        '</td>' +
                        '</tr>'
                    );
                } else {
                    let imageUrl = `https://ilibrary.zreky.muccs.host/front-end/css/img/0.png?${new Date().getTime()}`;

                    $('#users-table tbody').append(
                        '<td>'+
                            '<img id="profile-pic" src="'+ imageUrl +'">' +
                        '</td>' +
                        '<td>' + user.admin_id + '</td>' +
                        '<td>' + user.fname + ' ' + user.lname + '</td>' +
                        '<td>' + user.email + '</td>' +
                        '<td>' + user.status + '</td>' +
                        '<td>' +
                            '<a href="#" class="action-btn edit-btn" data-id="' + user.admin_id + '" title="Edit">' +
                                '<i class="bi bi-pencil-fill"></i>' +
                            '</a> ' +
                            '<a href="#" class="action-btn delete-btn" data-id="' + user.admin_id + '" title="Delete">' +
                                '<i class="bi bi-trash-fill"></i>' +
                            '</a>' +
                        '</td>' +
                        '</tr>'
                    );
                }
            });    
        });
    }

    $('#subject-table').on('click', '.edit-btn[data-id]', function () {
        const subId = $(this).data('id');
        setCookie("sub_id", subId, 7);
        window.location.href = 'edit-subject.html';
    });

    // Function to setup pagination with limited visible page buttons
    function setupPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / rowsPerPage);
        const pageNumbersContainer = $('#page-numbers');
        pageNumbersContainer.empty();
        
        const maxVisiblePages = 5; // Limit the number of visible page buttons
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust startPage if reaching the end of total pages
        if (endPage - startPage < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Add page numbers dynamically
        for (let i = startPage; i <= endPage; i++) {
            pageNumbersContainer.append(`<button class="page-btn" data-page="${i}">${i}</button>`);
        }

        // Update the pagination buttons state
        updatePaginationButtons(totalPages);

        // Page number button click handler
        $('.page-btn[data-page]').click(function () {
            currentPage = parseInt($(this).data('page'));
            displayUsers(currentPage);
            setupPagination(usersData.length); // Refresh pagination with the current page set
        });
    }

    // Update the Next, Previous, and active page buttons
    function updatePaginationButtons(totalPages) {
        $('#prev-btn').prop('disabled', currentPage === 1);
        $('#next-btn').prop('disabled', currentPage >= totalPages);

        // Highlight the current page button
        $('.page-btn[data-page]').removeClass('active');
        $(`.page-btn[data-page=${currentPage}]`).addClass('active');
    }

    // Previous button click handler
    $('#prev-btn').click(function () {
        if (currentPage > 1) {
            currentPage--;
            displayUsers(currentPage);
            setupPagination(usersData.length);
        }
    });

    // Next button click handler
    $('#next-btn').click(function () {
        if (currentPage < Math.ceil(subjectsData.length / rowsPerPage)) {
            currentPage++;
            displayUsers(currentPage);
            setupPagination(usersData.length);
        }
    });

    // Search functionality
    $('.form-control').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filteredUsers = usersData.filter(function (subject) {
            return subject.sub_name.toLowerCase().includes(searchTerm) ||
                   subject.sub_desc.toLowerCase().includes(searchTerm);
        });

        // Reset pagination for the filtered data
        currentPage = 1;
        usersData = filteredUsers;
        displayUsers(currentPage);
        setupPagination(usersData.length);
    });
});
