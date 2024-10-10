$(document).ready(function () {
    let currentPage = 1;
    const rowsPerPage = 5; // Number of rows per page
    let publisherData = [];

    // AJAX request to get publisher from the API
    $.ajax({
        url: `https://ilibrary.zreky.muccs.host/back-end/api-publisher/v1/publishers`,
        //url: 'http://localhost/ilibrary/admin-side/back-end/api-publisher/v1/publishers',
        type: 'GET',
        success: function (data) {
            publisherData = data;
            displayPublishers(currentPage);
            setupPagination(publisherData.length);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching publisher:', error);
        }
    });

    // Function to display publishers on the current page
    function displayPublishers(page) {
        $('#publisher-table tbody').empty();
        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let publishersToShow = publisherData.slice(start, end);
        // Append each publisher as a row in the table
        $.each(publishersToShow, function (index, publisher) {
            $('#publisher-table tbody').append(
                '<tr>' +
                '<td>' + publisher.pub_id + '</td>' +
                '<td>' + publisher.pub_name + '</td>' +
                '<td>' + publisher.pub_address + '</td>' +
                '<td>' + publisher.contact_num + '</td>' +
                '<td>' + publisher.email + '</td>' +
                '<td>' +
                    '<a href="#" class="action-btn edit-btn" data-id="' + publisher.pub_id + '" title="Edit">' +
                        '<i class="bi bi-pencil-fill"></i>' +
                    '</a> ' +
                    '<a href="#" class="action-btn delete-btn" data-id="' + publisher.pub_id + '" title="Delete">' +
                        '<i class="bi bi-trash-fill"></i>' +
                    '</a>' +
                '</td>' +
                '</tr>'
            );
        });
    }

    $('#publisher-table').on('click', '.edit-btn[data-id]', function () {
        const pubId = $(this).data('id');
        setCookie("pub_id", pubId, 7);
        window.location.href = 'edit-publisher.html';
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
            displayPublishers(currentPage);
            setupPagination(publisherData.length); // Refresh pagination with the current page set
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
            displayPublishers(currentPage);
            setupPagination(publisherData.length);
        }
    });

    // Next button click handler
    $('#next-btn').click(function () {
        if (currentPage < Math.ceil(publisherData.length / rowsPerPage)) {
            currentPage++;
            displayPublishers(currentPage);
            setupPagination(publisherData.length);
        }
    });

    // Search functionality
    $('.form-control').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filteredPublisher = publisherData.filter(function (publisher) {
            return  publisher.pub_name.toLowerCase().includes(searchTerm) ||
                    publisher.email.toLowerCase().includes(searchTerm) ||
                    publisher.contact_num.toLowerCase().includes(searchTerm);
        });

        // Reset pagination for the filtered data
        currentPage = 1;
        publisherData = filteredPublisher;
        displayPublishers(currentPage);
        setupPagination(publisherData.length);
    });
});
