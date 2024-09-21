/* $(document).ready(function() {
    // Hide spinner and OCR result initially
    $('#spinnerContainer').hide();
    $('#ocrResultContainer').hide();
    $('#ocrError').hide();

    // Function to fetch subjects from the API
    function fetchSubjects() {
        return $.ajax({
            url: 'http://localhost/ilibrary/back-end/api-ocr/v1/subjects',
            method: 'GET',
            dataType: 'json'
        }).done(function(data) {
            console.log('Fetched subjects:', data); // Log fetched subjects data
            return data.subjects; // Adjust this if the structure is different
        }).fail(function(err) {
            console.error('Error fetching subjects:', err);
            $('#ocrError').text('Error fetching subjects from the database. Please try again.');
            $('#ocrError').show();
        });
    }

    // Function to match subjects with OCR text
    function matchSubjects(ocrText, subjects) {
        let matchedSubjects = [];

        console.log('OCR Text:', ocrText); // Log OCR text for inspection
        console.log('Subjects from API:', subjects); // Log subjects to check their structure

        subjects.forEach(subject => {
            console.log('Subject object:', subject); // Log each subject object

            const subjectName = subject.sub_name ? subject.sub_name.toLowerCase() : '';
            console.log('Subject name:', subjectName); // Log subject name

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

    // Function to display matched subjects in the modal
    function displayMatchedSubjects(matchedSubjects) {
        const container = $('#matchedSubjectsContainer');
        container.empty(); // Clear previous content

        if (matchedSubjects.length === 0) {
            container.append('<p>No subjects matched with the OCR text.</p>');
        } else {
            matchedSubjects.forEach(subject => {
                const subjectHtml = `<strong>${subject.name}</strong>: ${subject.desc}<br>`;
                container.append(subjectHtml);
            });
        }
    }

    // Handle the upload button click event
    $('#uploadFile').click(function() {
        var fileInput = $('#imageUploadModal')[0];
        var file = fileInput.files[0];

        if (file) {
            // Check if the file type is valid
            var validTypes = ['image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                $('#ocrError').text('Invalid file format. Please upload a JPG or PNG image.');
                $('#ocrError').show();
                return;
            }

            // Clear any previous errors and results
            $('#ocrError').hide();
            $('#ocrResult').text('');

            // Show the spinner while processing
            $('#spinnerContainer').show();
            $('#ocrResultContainer').hide();

            // Fetch subjects from the API
            fetchSubjects().then(function(subjects) {
                // Preprocess and display the image first
                preprocessImage(file, function(processedImageUrl) {
                    $('#preprocessedImage').attr('src', processedImageUrl).show(); // Display the pre-processed image

                    // Start OCR processing after displaying the image
                    Tesseract.recognize(
                        processedImageUrl,
                        'eng',
                        {
                            logger: (m) => {
                                console.log(`Progress: ${Math.round(m.progress * 100)}% - ${m.status}`); // Log OCR progress
                            }
                        }
                    ).then(({ data: { text } }) => {
                        // Log extracted text in console
                        console.log('Extracted Text:', text);

                        // Hide the spinner and show results
                        $('#spinnerContainer').hide();
                        $('#ocrResultContainer').show();

                        // Match extracted text with subjects from the API
                        const matchedSubjects = matchSubjects(text, subjects);

                        // Display matched subjects in the modal
                        displayMatchedSubjects(matchedSubjects);

                    }).catch((error) => {
                        // Hide the spinner and display the error
                        $('#spinnerContainer').hide();
                        $('#ocrError').text('An error occurred while processing the image. Please try again.');
                        $('#ocrError').show();
                        console.error('Error during OCR processing:', error);
                    });
                });
            });
        } else {
            // No file uploaded
            $('#ocrError').text('Please select an image to upload.');
            $('#ocrError').show();
        }
    });

    // Function to preprocess image (binarization and resizing)
    function preprocessImage(imageFile, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            // Resize image
            canvas.width = img.width * 3; // Increase width by a factor of 2
            canvas.height = img.height * 3; // Increase height by a factor of 2
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Apply binarization
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                // Convert to grayscale
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                // Apply threshold (e.g., 128)
                const binary = avg > 170 ? 255 : 0;

                data[i] = binary;       // Red
                data[i + 1] = binary;   // Green
                data[i + 2] = binary;   // Blue
            }

            ctx.putImageData(imageData, 0, 0);
            callback(canvas.toDataURL('image/png')); // Pass the processed image as a Data URL
        };

        img.src = URL.createObjectURL(imageFile);
    }
});
 */
