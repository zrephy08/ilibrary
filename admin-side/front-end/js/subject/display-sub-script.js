$(document).ready(function () {
    let currentPage = 1;
    const rowsPerPage = 5; // Number of rows per page
    let subjectsData = [];

    // AJAX request to get subjects from the API
    $.ajax({
        url: `https://ilibrary.zreky.muccs.host/back-end/api-subject/v1/subjects`,
        //url: 'http://localhost/ilibrary/admin-side/back-end/api-subject/v1/subjects',
        type: 'GET',
        success: function (data) {
            subjectsData = data;
            displaySubjects(currentPage);
            setupPagination(subjectsData.length);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching subjects:', error);
        }
    });

    // Function to display subjects on the current page
    function displaySubjects(page) {
        $('#subject-table tbody').empty();
        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let subjectsToShow = subjectsData.slice(start, end);
        // Append each subject as a row in the table
        $.each(subjectsToShow, function (index, subject) {
            $('#subject-table tbody').append(
                '<tr>' +
                '<td>' + subject.sub_id + '</td>' +
                '<td>' + subject.sub_name + '</td>' +
                '<td>' + subject.sub_desc + '</td>' +
                '<td>' +
                    '<a href="#" class="action-btn edit-btn" data-id="' + subject.sub_id + '" title="Edit">' +
                        '<i class="bi bi-pencil-fill"></i>' +
                    '</a> ' +
                    '<a href="#" class="action-btn delete-btn" data-id="' + subject.sub_id + '" title="Delete">' +
                        '<i class="bi bi-trash-fill"></i>' +
                    '</a>' +
                '</td>' +
                '</tr>'
            );
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
            displaySubjects(currentPage);
            setupPagination(subjectsData.length); // Refresh pagination with the current page set
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
            displaySubjects(currentPage);
            setupPagination(subjectsData.length);
        }
    });

    // Next button click handler
    $('#next-btn').click(function () {
        if (currentPage < Math.ceil(subjectsData.length / rowsPerPage)) {
            currentPage++;
            displaySubjects(currentPage);
            setupPagination(subjectsData.length);
        }
    });

    // Search functionality
    $('.form-control').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filteredSubjects = subjectsData.filter(function (subject) {
            return subject.sub_name.toLowerCase().includes(searchTerm) ||
                   subject.sub_desc.toLowerCase().includes(searchTerm);
        });

        // Reset pagination for the filtered data
        currentPage = 1;
        subjectsData = filteredSubjects;
        displaySubjects(currentPage);
        setupPagination(subjectsData.length);
    });
});
