$(document).ready(function() {
    const matchedSubjectsString = sessionStorage.getItem('matchedSubjects');

    console.log('Retrieved matched subjects:', matchedSubjectsString);

    if (matchedSubjectsString) {
        try {
            const matchedSubjects = JSON.parse(matchedSubjectsString);
            const container = $('#matchedSubjectsContainer');
            container.empty();

            if (matchedSubjects.length === 0) {
                container.append('<p>No subjects matched with the OCR text.</p>');
            } else {
                matchedSubjects.forEach(subject => {
                    const subjectHtml = `<div class="result-card" data-subject-id="${subject.id}" color: inherit;">
                                            <a href="#" style="text-decoration: none; color: inherit;">
                                                <div class="content1">
                                                    <h2>${subject.name}</h2>
                                                    <p>${subject.desc}</p>
                                                </div>
                                                <div class="content2">
                                                    <span id="arrow">&gt;</span> <!-- Greater than symbol -->
                                                </div>
                                            </a>
                                        </div>`;
                    container.append(subjectHtml);
                });
            }
        } catch (error) {
            console.error('Error parsing matched subjects:', error);
            $('#matchedSubjectsContainer').append('<p>Error parsing matched subjects data.</p>');
        }
    } else {
        $('#matchedSubjectsContainer').append('<p>No matched subjects available.</p>');
    }

    $(document).on('click', '.result-card', function(event) {
        event.preventDefault(); // Prevent default anchor click behavior

        const subjectId = $(this).data('subject-id'); 
        setCookie("res-subId", subjectId, 7);

        // Redirect to the desired page
        window.location.href = 'subject-holdings.html';
    });

    // Optionally, clear session storage if not needed anymore
    //sessionStorage.removeItem('ocrResult');
    //sessionStorage.removeItem('matchedSubjects');
});