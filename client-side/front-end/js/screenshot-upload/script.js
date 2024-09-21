$(document).ready(function() {
    // Hide spinner and OCR result initially (Testing purposes)
    $('#spinnerContainer').hide();
    $('#ocrResultContainer').hide();
    $('#ocrError').hide();

    // Define the target size for resizing
    const targetWidth = 2250;
    const targetHeight = 1600;

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function executeWithDelay() {
        console.log("This will run first");

        // Delay the execution here
        await delay(5000); // Waits for 2 seconds
    
        console.log("This will run after a 2-second delay");
    }

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
        
        //$('#progressText').text(`${stages[stage]} ${percentage}%`);
        //document.getElementById('loadingContainer').style.display = 'flex';
    }

    // Function to resize the image to the target size
    function resizeImage(image) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
    
            // Set the canvas size to the target dimensions
            canvas.width = targetWidth;
            canvas.height = targetHeight;
    
            // Resize the image and draw it on the canvas
            ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    
            // Resolve with the canvas instead of the blob
            resolve(canvas);
        });
    }    

    // Function to crop the image based on the ROI
    function cropROI(canvas, roi) {
        return new Promise((resolve) => {
            const ctx = canvas.getContext('2d');
    
            const roiCanvas = document.createElement('canvas');
            const roiCtx = roiCanvas.getContext('2d');
    
            // Set the canvas size to the ROI dimensions
            roiCanvas.width = roi.width;
            roiCanvas.height = roi.height;
    
            // Draw the cropped region from the original canvas onto the new canvas
            roiCtx.drawImage(
                canvas, 
                roi.x, roi.y, roi.width, roi.height, 
                0, 0, roi.width, roi.height
            );
    
            // Convert the cropped canvas to a base64 Data URL
            const croppedImageUrl = roiCanvas.toDataURL('image/jpeg');
            resolve(croppedImageUrl);
        });
    }

    // Function to convert a Data URL to a Blob
    function dataURLToBlob(dataURL) {
        const [header, data] = dataURL.split(',');
        const mime = header.split(':')[1].split(';')[0];
        const binary = atob(data);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: mime });
    }

    // Function to fetch subjects from the API
    function fetchSubjects() {
        return $.ajax({
            url: 'http://localhost/ilibrary/back-end/api-ocr/v1/subjects',
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

    // (Testing purposes)
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

    function preprocessImage(imageFile, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
    
        img.onload = function() {
            // Resize image
            canvas.width = img.width * 3; // Increase width by a factor of 10
            canvas.height = img.height * 3; // Increase height by a factor of 10
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
            // Get the image data for histogram equalization
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
    
            // Apply histogram equalization
            const hist = new Array(256).fill(0);
            let totalPixels = canvas.width * canvas.height;
    
            // Calculate the histogram for grayscale values
            for (let i = 0; i < data.length; i += 4) {
                const grayscale = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
                hist[grayscale]++;
            }
    
            // Calculate the cumulative distribution function (CDF)
            const cdf = new Array(256).fill(0);
            cdf[0] = hist[0];
            for (let i = 1; i < 256; i++) {
                cdf[i] = cdf[i - 1] + hist[i];
            }
    
            // Normalize the CDF
            const cdfMin = cdf.find(value => value > 0);
            const cdfMax = cdf[255];
            for (let i = 0; i < 256; i++) {
                cdf[i] = ((cdf[i] - cdfMin) / (cdfMax - cdfMin)) * 255;
            }
    
            // Apply histogram equalization to the image
            for (let i = 0; i < data.length; i += 4) {
                const grayscale = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
                const equalizedValue = Math.floor(cdf[grayscale]);
    
                // Set the new RGB values to the equalized grayscale value
                data[i] = equalizedValue;
                data[i + 1] = equalizedValue;
                data[i + 2] = equalizedValue;
            }
    
            // Binarize the image after equalization
            const threshold = 17; // Adjust this threshold as needed
            let blackPixelCount = 0; // Initialize black pixel counter
    
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const binary = avg > threshold ? 255 : 0;
    
                // Count black pixels
                if (binary === 0) {
                    blackPixelCount++;
                }
    
                data[i] = binary;       // Red
                data[i + 1] = binary;   // Green
                data[i + 2] = binary;   // Blue
            }
    
            // Put the processed image data back onto the canvas
            ctx.putImageData(imageData, 0, 0);
    
            // Calculate black pixel percentage
            const blackPixelPercentage = (blackPixelCount / totalPixels) * 100;
            console.log('Black Pixel Percentage:', blackPixelPercentage);
    
            // Handle too many black spots
            const thresholdBlackPixels = 15; // Adjust as needed
            if (blackPixelPercentage > thresholdBlackPixels) {
                console.warn('Too many black spots detected after binarization.');
                // You can handle this case as needed (e.g., alert the user or adjust processing)
            }
    
            // Pass the processed image as a Data URL
            callback(canvas.toDataURL('image/png'));
        };
    
        img.src = URL.createObjectURL(imageFile);
    }

    // Handle the upload button click event
    $('#upload-btn').click(function() {
        // Show the upload instructions modal first
        $('#uploadInstructionsModal').modal('show');

        $('#got-it-btn').one('click', function() {
            // Once the user clicks "Got It", trigger the file input to select the file
            $('#fileInput').click();
        });
    });

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function executeWithDelay(ms = 1000) { // Default delay of 1 second
        await delay(ms);
    }

    // Handle file selection when a file is chosen
    $('#fileInput').change(async function(event) {
        var file = event.target.files[0];

        if (file) {
            // Check if the file type is valid (Testing purposes)
            var validTypes = ['image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                $('#ocrError').text('Invalid file format. Please upload a JPG or PNG image.');
                $('#ocrError').show();
                return;
            }

            // Clear any previous errors and results (Testing purposes)
            $('#ocrError').hide();
            $('#ocrResult').text('');

            // Show the spinner while processing (Testing purposes)
            $('#spinnerContainer').show();
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
                            y: 250, 
                            width: 500,
                            height: 1000 
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

                                updateProgress('startocr', 0);
                                await executeWithDelay(1000); // Adding 1 second delay

                                // Proceed with OCR processing using the cropped image URL
                                Tesseract.recognize(
                                    processedImageUrl,
                                    'eng',
                                    {   
                                        // Optional: Log OCR progress
                                        logger: async (m) => {
                                            if (m.status === 'recognizing text') {
                                                // Update progress
                                                const progress = Math.round(m.progress * 100);
                                                if(progress == 0){
                                                    updateProgress('startocr', 100);
                                                    await executeWithDelay(4000); // Adding 1 second delay
                                                }
                                                updateProgress('ocr', progress);
                                                console.log(`Progress: ${progress}% - ${m.status}`);
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
    });

});
