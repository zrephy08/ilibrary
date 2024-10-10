$(document).ready(function () {
    let currentPage = 1;
    const rowsPerPage = 5; // Number of rows per page
    let authorData = [];

    // AJAX request to get publisher from the API
    $.ajax({
        url: `https://ilibrary.zreky.muccs.host/back-end/api-author/v1/authors`,
        //url: 'http://localhost/ilibrary/admin-side/back-end/api-author/v1/authors',
        type: 'GET',
        success: function (data) {
            authorData = data;
            displayAuthor(currentPage);
            setupPagination(authorData.length);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching publisher:', error);
        }
    });

    // Function to display author on the current page
    function displayAuthor(page) {
        $('#author-table tbody').empty();
        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let authorToShow = authorData.slice(start, end);
        // Append each publisher as a row in the table
        $.each(authorToShow, function (index, author) {
            $('#author-table tbody').append(
                '<tr>' +
                '<td>' + author.author_id + '</td>' +
                '<td>' + author.fname + '</td>' +
                '<td>' + author.lname + '</td>' +
                '<td>' + author.bio + '</td>' +
                '<td>' +
                    '<a href="#" class="action-btn edit-btn" data-id="' + author.author_id + '" title="Edit">' +
                        '<i class="bi bi-pencil-fill"></i>' +
                    '</a> ' +
                    '<a href="#" class="action-btn delete-btn" data-id="' + author.author_id + '" title="Delete">' +
                        '<i class="bi bi-trash-fill"></i>' +
                    '</a>' +
                '</td>' +
                '</tr>'
            );
        });
    }

    $('#author-table').on('click', '.edit-btn[data-id]', function () {
        const pubId = $(this).data('id');
        setCookie("auth_id", pubId, 7);
        window.location.href = 'edit-author.html';
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
            displayAuthor(currentPage);
            setupPagination(authorData.length); // Refresh pagination with the current page set
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
            displayAuthor(currentPage);
            setupPagination(authorData.length);
        }
    });

    // Next button click handler
    $('#next-btn').click(function () {
        if (currentPage < Math.ceil(authorData.length / rowsPerPage)) {
            currentPage++;
            displayAuthor(currentPage);
            setupPagination(authorData.length);
        }
    });

    // Search functionality
    $('.form-control').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filteredAuthor = authorData.filter(function (author) {
            return  author.author_id.toLowerCase().includes(searchTerm) ||
                    author.fname.toLowerCase().includes(searchTerm) ||
                    author.lname.toLowerCase().includes(searchTerm);
        });

        // Reset pagination for the filtered data
        currentPage = 1;
        authorData = filteredAuthor;
        displayAuthor(currentPage);
        setupPagination(authorData.length);
    });
});
