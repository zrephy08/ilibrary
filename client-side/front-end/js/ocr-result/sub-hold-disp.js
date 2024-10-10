$(document).ready(function () {
    const contentContainer = $('.content-container');
    let authorsData = {};
    let publishersData = {};
    let holdingsData = [];
    let filteredHoldingsData = []; // To store filtered data after search
    let currentPage = 1;
    const rowsPerPage = 5; // Number of rows per page

    // Function to fetch holdings using AJAX
    function fetchHoldings() {
        const RsubId = getCookie('res-subId');

        $.ajax({
            url: `https://ilibrary.zreky.muccs.host/back-end/api-match-hold-sub/v1/holdings/${RsubId}`,
            //url: `http://localhost/ilibrary/client-side/back-end/api-match-hold-sub/v1/holdings/${RsubId}`, // Replace with your actual API URL
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                holdingsData = data; // Store the fetched holdings data
                filteredHoldingsData = holdingsData; // Initially, filtered data is the same as fetched data
                $.when(getAuthorsData(), getPublishersData()).done(function () {
                    displayHoldings(currentPage); // Display the holdings data after authors and publishers are loaded
                    setupPagination(filteredHoldingsData.length); // Setup pagination after displaying holdings
                });
            },
            error: function (error) {
                console.error('Error fetching holdings:', error);
                contentContainer.html("<p>Failed to load holdings. Please try again later.</p>");
            }
        });
    }

    // Function to get authors and publishers data using promises
    function getAuthorsData() {
        return $.ajax({
            url: `https://ilibrary.zreky.muccs.host/back-end/api-author/v1/authors`,
            //url: 'http://localhost/ilibrary/admin-side/back-end/api-author/v1/authors',
            type: 'GET',
            success: function (data) {
                authorsData = mapAuthorsData(data); // Map authors data to ID
            },
            error: function (xhr, status, error) {
                console.error('Error fetching authors:', error);
            }
        });
    }

    function getPublishersData() {
        return $.ajax({
            url: `https://ilibrary.zreky.muccs.host/back-end/api-publisher/v1/publishers`,
            //url: 'http://localhost/ilibrary/admin-side/back-end/api-publisher/v1/publishers',
            type: 'GET',
            success: function (data) {
                publishersData = mapPublishersData(data); // Map publishers data to ID
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

    // Function to display holdings in the content-container based on the current page
    function displayHoldings(page) {
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const holdingsToDisplay = filteredHoldingsData.slice(startIndex, endIndex);

        if (holdingsToDisplay.length === 0) {
            contentContainer.html("<p>No holdings available.</p>");
            return;
        }

        let holdingsHtml = '';
        $.each(holdingsToDisplay, function (index, holding) {
            let authorName = authorsData[holding.author_id] || 'Unknown';
            let publisherName = publishersData[holding.pub_id] || 'Unknown';

            holdingsHtml += `
                <div class="holding-card" data-holding-id="${holding.hold_id}">
                    <h4 class="holding-title">${holding.title}</h4>
                    <div class="sml-info">
                        <p>
                            <strong>Edition:</strong> ${holding.edition}
                            <strong>Author:</strong> ${authorName}
                        </p>
                        <p>
                            <strong>Publisher:</strong> ${publisherName}
                            <strong>Copies:</strong> ${holding.copies}
                        </p>
                    </div>
                </div>
            `;
        });

        // Insert the HTML into the content-container
        contentContainer.html(holdingsHtml);

        // Add click event listener to each holding card
        $('.holding-card').on('click', function () {
            const holdingId = $(this).data('holding-id');
            setCookie("DholdId", holdingId, 7);
            window.location.href = `holding-details.html`; // Redirect to details page with holding ID
        });
    }

    // Function to setup pagination with limited visible page buttons
    function setupPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / rowsPerPage);
        const pageNumbersContainer = $('#page-numbers');
        pageNumbersContainer.empty();
                
        const maxVisiblePages = 3; // Limit the number of visible page buttons
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
            setupPagination(filteredHoldingsData.length); // Refresh pagination with the current page set
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
            setupPagination(filteredHoldingsData.length);
        }
    });

    // Next button click handler
    $('#next-btn').click(function () {
        if (currentPage < Math.ceil(filteredHoldingsData.length / rowsPerPage)) {
            currentPage++;
            displayHoldings(currentPage);
            setupPagination(filteredHoldingsData.length);
        }
    });

    // Function to perform the search and update the display
    function performSearch() {
        const searchTerm = $('.search-input').val().toLowerCase(); // Get the value from the search input
        filteredHoldingsData = holdingsData.filter(holding => 
            holding.title.toLowerCase().includes(searchTerm) ||
            (authorsData[holding.author_id] && authorsData[holding.author_id].toLowerCase().includes(searchTerm)) ||
            (publishersData[holding.pub_id] && publishersData[holding.pub_id].toLowerCase().includes(searchTerm))
        );
        currentPage = 1; // Reset to the first page
        displayHoldings(currentPage); // Display the filtered results
        setupPagination(filteredHoldingsData.length); // Update pagination based on the filtered data
    }

    // Search button click functionality
    $('.search-button').on('click', function () {
        performSearch();
    });

    // Search input field "Enter" key press functionality
    $('.search-input').on('keypress', function (e) {
        if (e.which === 13) { // 13 is the Enter key code
            performSearch();
        }
    });

    // Call fetchHoldings to load holdings when the page is ready
    fetchHoldings();
});
