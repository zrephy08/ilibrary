$(document).ready(function() {
    // Hide spinner and OCR result initially (Testing purposes)
    $('#spinnerContainer').hide();
    $('#ocrResultContainer').hide();
    $('#ocrError').hide();

    // Function to update progress of entire process of OCR
    function updateProgress(stage, percentage) {
        const stages = {
            'start': 'Starting',
            'resizing': 'Resizing Image',
            'cropping': 'Cropping Image',
            'preprocessing': 'Preprocessing Image',
            'startocr': 'OCR Initializing',
            'ocr': 'Recognizing Text',
            'completed': 'Processing Completed'
        };
        
        $('#progressText').text(`${stages[stage]} ${percentage}%`);
        document.getElementById('loadingContainer').style.display = 'flex';
    }

    // PART OF TESTING
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

    //Variable to ensure that file input is triggered once only
    let fileInputTriggered = false;
    
    // Handle the upload button click event
    $('#upload-btn').click(function() {
        if (!fileInputTriggered) {
            // Show the upload instructions modal first
            $('#uploadInstructionsModal').modal('show');
            fileInputTriggered = true;
        }
    });
    
    // Handle "Got It" button click
    $('#got-it-btn').click(function() {

        if (fileInputTriggered) {
            // Trigger the file input to select the file after modal confirmation
            $('#fileInput').click();
            fileInputTriggered = false;
        }
    });
    
    // Handle file selection when a file is chosen
/*     $('#fileInput').change(async function(event) {

        fileInputTriggered = false;

        var file = event.target.files[0];

        if (file) {
            // Check if the file type is valid
            var validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

            if (!validTypes.includes(file.type)) {

                // display the error for test (Testing purposes)
                $('#ocrError').text('Invalid file format. Please upload a JPG or PNG image.');
                $('#ocrError').show();

                // display the error for client

                return;
            }

            // Clear any previous errors and results (Testing purposes)
            $('#ocrError').hide();
            $('#ocrResult').text('');

            // Hide the result container before processing (Testing purposes)
            $('#ocrResultContainer').hide();

            updateProgress('start', 0);
            await executeWithDelay(1000); // Adding 1 second delay

            // Create an image element to load the file
            const image = new Image();
            const reader = new FileReader();

            reader.onload = function(e) {
                image.src = e.target.result;

                image.onload = async function() {

                    updateProgress('resizing', 0);
                    await executeWithDelay(1000); // Adding 1 second delay

                    resizeImage(image).then(async (resizedCanvas) => {
                        
                        updateProgress('resizing', 100);
                        await executeWithDelay(1000); // Adding 1 second delay

                        const roi = {
                            x: 100,
                            y: 300, 
                            width: 400,
                            height: 500 
                        };

                        updateProgress('cropping', 0);
                        await executeWithDelay(1000); // Adding 1 second delay

                        // Crop the image based on the ROI
                        cropROI(resizedCanvas, roi).then(async (croppedImageUrl) => {

                            updateProgress('cropping', 100);
                            await executeWithDelay(1000); // Adding 1 second delay

                            // Convert cropped image URL to Blob
                            const croppedImageBlob = dataURLToBlob(croppedImageUrl);

                            updateProgress('preprocessing', 0);
                            await executeWithDelay(1000); // Adding 1 second delay

                            // Preprocess the cropped image
                            preprocessImage(croppedImageBlob, async function(processedImageUrl) {

                                updateProgress('preprocessing', 100);
                                await executeWithDelay(1000); // Adding 1 second delay

                                // (Testing purposes)
                                $('#croppedImage').attr('src', processedImageUrl).show();

                                updateProgress('ocr', 0);

                                // Proceed with OCR processing using the cropped image URL
                                Tesseract.recognize(
                                    processedImageUrl,
                                    'eng',
                                    {   
                                        // Optional: Log OCR progress
                                        logger: async (m) => {
                                            const progress = Math.round(m.progress * 100);
                                            console.log(`Progress: ${progress}% - ${m.status}`);
                                            if (m.status === 'recognizing text') {
                                                // Update progress
                                                const progress = Math.round(m.progress * 100);
                                                if(progress === 0){
                                                    updateProgress('ocr', progress);
                                                } else if (progress > 0) {
                                                    // Only update progress if it's greater than 0
                                                    updateProgress('ocr', progress);
                                                    console.log(`Progress: ${progress}% - ${m.status}`);
                                                }
                                            }
                                        },  
                                        tessedit_ocr_engine_mode: 2  // Use Legacy + LSTM OCR engine (OEM 2)
                                    }
                                ).then(async ({ data: { text } }) => {
                                    console.log('Extracted Text:', text); // Log extracted text

                                    // (Testing purposes)
                                    $('#spinnerContainer').hide();
                                    $('#ocrResultContainer').show();

                                    // Fetch subjects and match them
                                    fetchSubjects().then(function(subjects) {
                                        const matchedSubjects = matchSubjects(text, subjects);
                                        displayMatchedSubjects(matchedSubjects); // Display the matched subjects

                                        sessionStorage.setItem('ocrResult', text);
                                        sessionStorage.setItem('matchedSubjects', JSON.stringify(matchedSubjects));
                                    });

                                    await executeWithDelay(2000);
                                    //window.location.href = 'ocr-result.html';

                                }).catch((error) => {
                                    $('#spinnerContainer').hide();
                                    $('#ocrError').text('An error occurred while processing the image. Please try again.');
                                    $('#ocrError').show();
                                    console.error('Error during OCR processing:', error);
                                    
                                });
                            });
                        });
                    });
                };
            };

            reader.readAsDataURL(file);
        } else {
            $('#ocrError').text('Please select an image to upload.');
            $('#ocrError').show();
        }
    }); */

    $('#fileInput').change(async function(event) {
        fileInputTriggered = false;
        
        const file = event.target.files[0];
        if (!file) {
            // PART OF TESTING
            displayError('Please select an image to upload.');
            return;
        }
    
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            // PART OF TESTING
            displayError('Invalid file format. Please upload a JPG or PNG image.');
            return;
        }
    
        // Clear previous errors and hide result container
        clearError();
        resetResultContainer();
    
        // Process image step by step with progress updates
        try {
            updateProgress('start', 0);
            await delay(1000);
    
            const image = await loadImage(file);
            updateProgress('resizing', 0);
            await delay(1000);
    
            const resizedCanvas = await resizeImage(image);
            updateProgress('resizing', 100);
            await delay(1000);
    
            const roi = { x: 100, y: 300, width: 400, height: 500 };
            updateProgress('cropping', 0);
            await delay(1000);
    
            const croppedImageUrl = await cropROI(resizedCanvas, roi);
            updateProgress('cropping', 100);
            await delay(1000);
    
            const croppedImageBlob = dataURLToBlob(croppedImageUrl);
            updateProgress('preprocessing', 0);
            await delay(1000);
    
            const processedImageUrl = await preprocessImage(croppedImageBlob);

            // PART OF TESTING
            $('#croppedImage').attr('src', processedImageUrl).show();
            
            updateProgress('preprocessing', 100);
            await delay(1000);
    
            await performOCR(processedImageUrl);
        } catch (error) {
            displayError('An error occurred during image processing. Please try again.');
            console.error('Error during image processing:', error);
        }
    });
    
    // Function to perform OCR
    async function performOCR(imageUrl) {
        updateProgress('ocr', 0);
        try {
            const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
                logger: (m) => updateOCRProgress(m),
                tessedit_ocr_engine_mode: 2 // Use Legacy + LSTM OCR engine (OEM 2)
            });
    
            console.log('Extracted Text:', text);
            $('#spinnerContainer').hide();
            $('#ocrResultContainer').show();
    
            const subjects = await fetchSubjects();
            const matchedSubjects = matchSubjects(text, subjects);
            displayMatchedSubjects(matchedSubjects);
    
            sessionStorage.setItem('ocrResult', text);
            sessionStorage.setItem('matchedSubjects', JSON.stringify(matchedSubjects));
    
            await delay(2000);
            window.location.href = 'ocr-result.html'; // Uncomment for actual redirection
        } catch (error) {
            displayError('An error occurred during OCR. Please try again.');
            console.error('Error during OCR processing:', error);
        }
    }

    // Function to update OCR progress
    function updateOCRProgress(m) {
        const progress = Math.round(m.progress * 100);
        if (m.status === 'recognizing text' && progress > 0) {
            updateProgress('ocr', progress);
            console.log(`Progress: ${progress}% - ${m.status}`);
        }
    }

});
