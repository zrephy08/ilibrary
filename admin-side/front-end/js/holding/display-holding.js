$(document).ready(function () {

    let currentPage = 1;
    const rowsPerPage = 5; // Number of rows per page
    let holdingsData = [];
    let authorsData = {};
    let publishersData = {};

    // AJAX request to get holdings from the API
    $.ajax({
        url: 'http://localhost/ilibrary/admin-side/back-end/api-holding/v1/holdings',
        type: 'GET',
        success: function (data) {
            holdingsData = data;

            $.when(getAuthorsData(), getPublishersData()).done(function () {
                displayHoldings(currentPage);
                setupPagination(holdingsData.length);
            });
        },
        error: function (xhr, status, error) {
            console.error('Error fetching holdings:', error);
        }
    });

    // Function to get authors and publishers data using promises
    function getAuthorsData() {
        return $.ajax({
            url: 'http://localhost/ilibrary/admin-side/back-end/api-author/v1/authors',
            type: 'GET',
            success: function (data) {
                authorsData = mapAuthorsData(data);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching authors:', error);
            }
        });
    }

    function getPublishersData() {
        return $.ajax({
            url: 'http://localhost/ilibrary/admin-side/back-end/api-publisher/v1/publishers',
            type: 'GET',
            success: function (data) {
                publishersData = mapPublishersData(data);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching publishers:', error);
            }
        });
    }

    // Function to map authors data by their ID
    function mapAuthorsData(data) {
        let authorsMap = {};
        data.forEach(author => {
            authorsMap[author.author_id] = `${author.fname} ${author.lname}`;
        });
        return authorsMap;
    }

    // Function to map publishers data by their ID
    function mapPublishersData(data) {
        let publishersMap = {};
        data.forEach(publisher => {
            publishersMap[publisher.pub_id] = publisher.pub_name;
        });
        return publishersMap;
    }

    // Function to display holdings on the current page
    function displayHoldings(page, data = holdingsData) {
        $('#holding-table tbody').empty();
        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let holdingsToShow = data.slice(start, end);
    
        // Append each holding as a row in the table
        $.each(holdingsToShow, function (index, holding) {
            let authorName = authorsData[holding.author_id] || 'Unknown';
            let publisherName = publishersData[holding.pub_id] || 'Unknown';
    
            $('#holding-table tbody').append(
                '<tr>' +
                '<td>' + holding.hold_id + '</td>' +
                '<td>' + holding.title + '</td>' +
                '<td>' + holding.edition + '</td>' +
                '<td>' + authorName + '</td>' +
                '<td>' + publisherName + '</td>' +
                '<td>' + holding.copies + '</td>' +
                '<td>' +
                    '<a href="#" class="action-btn edit-btn" data-id="' + holding.hold_id + '" title="Edit">' +
                        '<i class="bi bi-pencil-fill"></i>' +
                    '</a> ' +
                    '<a href="#" class="action-btn delete-btn" data-id="' + holding.hold_id + '" title="Delete">' +
                        '<i class="bi bi-trash-fill"></i>' +
                    '</a>' +
                '</td>' +
                '</tr>'
            );
        });
    }

    // Edit button click handler
    $('#holding-table').on('click', '.edit-btn[data-id]', function () {
        const holdingId = $(this).data('id');
        setCookie("hold_id", holdingId, 7);
        window.location.replace('edit-holding.html');
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
            displayHoldings(currentPage);
            setupPagination(holdingsData.length); // Refresh pagination with the current page set
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
            displayHoldings(currentPage);
            setupPagination(holdingsData.length);
        }
    });

    // Next button click handler
    $('#next-btn').click(function () {
        if (currentPage < Math.ceil(holdingsData.length / rowsPerPage)) {
            currentPage++;
            displayHoldings(currentPage);
            setupPagination(holdingsData.length);
        }
    });

    // Search functionality
    $('.form-control').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();

        const filteredHoldings = holdingsData.filter(function (holding) {
            const authorName = authorsData[holding.author_id];
            const publisherName = publishersData[holding.pub_id];
    
            return holding.title.toLowerCase().includes(searchTerm) ||
                   authorName.toLowerCase().includes(searchTerm) ||
                   publisherName.toLowerCase().includes(searchTerm) ||
                   holding.hold_id.toLowerCase().includes(searchTerm);
        });
    

        // Reset pagination for the filtered data
        currentPage = 1;
        displayHoldings(currentPage, filteredHoldings);
        setupPagination(holdingData.length);
    });
});
