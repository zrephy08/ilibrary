$(document).ready(function () {
    const contentContainer = $('.content-container');
    let authorsData = {};
    let publishersData = {};
    let holdingsData = [];
    let currentPage = 1;
    const rowsPerPage = 5; // Number of rows per page

    // Function to fetch holdings using AJAX
    function fetchHoldings() {
        const CholdId = getCookie('DholdId');

        $.ajax({
            url: `https://ilibrary.zreky.muccs.host/back-end/api-holding/v1/holdings/${CholdId}`,
            //url: `http://localhost/ilibrary/admin-side/back-end/api-holding/v1/holdings/${CholdId}`,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                holdingsData = data; // Store the fetched holdings data
                $.when(getAuthorsData(), getPublishersData()).done(function () {
                    displayHoldings(currentPage); // Display the holdings data after authors and publishers are loaded
                    setupPagination(holdingsData.length); // Setup pagination after displaying holdings
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
            authorsMap[author.author_id] = `${author.fname} ${author.lname}`; // Use backticks for string interpolation
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
        const holdingsToDisplay = holdingsData.slice(startIndex, endIndex);

        if (holdingsToDisplay.length === 0) {
            contentContainer.html("<p>No holdings available.</p>");
            return;
        }

        let holdingsHtml = '';
        $.each(holdingsToDisplay, function (index, holding) {
            let authorName = authorsData[holding.author_id] || 'Unknown';
            let publisherName = publishersData[holding.pub_id] || 'Unknown';

            holdingsHtml += `
                <h4 class="holding-title">${holding.title}</h4>
                    <div class="info1">
                        <p><strong>Edition:</strong> ${holding.edition}</p>
                        <p><strong>Author:</strong> ${authorName}</p>
                        <p><strong>Publisher:</strong> ${publisherName}</p>
                        <p><strong>Date published:</strong> ${holding.published_date}</p>
                        <p><strong>ISBN:</strong> ${holding.isbn}</p>
                        <p><strong>Format:</strong> ${holding.format}</p>
                    </div>
                    <div class="info-table">
                        <table class="info2">
                            <thead>
                                <tr>
                                    <th>Accession Number</th>
                                    <th>Shelf Number</th>
                                    <th>Available Copies</th>
                                    <th>Subjects related</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${holding.accss_num}</td>
                                    <td>${holding.shelf_num}</td>
                                    <td>${holding.av_copies}</td>
                                    <td>${getSubjectsDisplay(holding.subjects)}</td>
                                </tr>
                            </tbody>
                        </table>
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
            pageNumbersContainer.append(`<button class="page-btn" data-page="${i}">${i}</button>`); // Use backticks for interpolation
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
        $(`.page-btn[data-page=${currentPage}]`).addClass('active'); // Use backticks for interpolation
    }

    // Function to get and display the subjects
    function getSubjectsDisplay(subjects) {
        let subjectsArray;

        // Check if subjects is already an array
        if (Array.isArray(subjects)) {
            subjectsArray = subjects;
        } else {
            try {
                // Try parsing it as JSON if it's a string
                subjectsArray = JSON.parse(subjects);
            } catch (error) {
                console.error('Error parsing subjects:', error);
                return 'No subjects available';
            }
        }

        // Map through the subjects array and join them by commas
        return subjectsArray.map(subject => subject.value).join(', ') || 'No subjects available';
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

    // Call fetchHoldings to load holdings when the page is ready
    fetchHoldings();
});
