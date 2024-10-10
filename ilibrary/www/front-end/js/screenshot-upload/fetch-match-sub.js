    // Function to fetch subjects from the API
    function fetchSubjects() {
        return $.ajax({
            url: 'https://ilibrary.zreky.muccs.host/back-end/api-subject/v1/subjects',
            //url: 'http://localhost/ilibrary/admin-side/back-end/api-ocr/v1/subjects',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                console.log('Fetched subjects:', data); // Log fetched subjects data
                return data.subjects; // Adjust this if the structure is different
            },
            error: function(err) {
                console.error('Error fetching subjects:', err);
                $('#ocrError').text('Error fetching subjects from the database. Please try again.');
                $('#ocrError').show();
            }
        });
    }

    // Function to match subjects with OCR text
    function matchSubjects(ocrText, subjects) {
        let matchedSubjects = [];

        //console.log('OCR Text:', ocrText); // Log OCR text for inspection
        //console.log('Subjects from API:', subjects); // Log subjects to check their structure

        subjects.forEach(subject => {
            const subjectName = subject.sub_name ? subject.sub_name.toLowerCase() : '';
            //console.log('Subject name:', subjectName); // Log subject name

            // Check if the full subject name exists in the OCR text
            if (ocrText.toLowerCase().includes(subjectName)) {
                matchedSubjects.push({
                    name: subject.sub_name,
                    desc: subject.sub_desc
                }); // Push the subject name and description to the matched list
            }
        });

        console.log('Matched Subjects:', matchedSubjects); // Log final matched subjects
        return matchedSubjects;
    }