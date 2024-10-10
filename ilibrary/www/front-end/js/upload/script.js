$(document).ready(function() {
    // Hide spinner and OCR result initially
    $('#spinnerContainer').hide();
    $('#ocrResultContainer').hide();
    $('#ocrError').hide();

    // Define the target size for resizing
    const targetWidth = 1750;
    const targetHeight = 1100;

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
    
            // Create an image element to load the file
            const image = new Image();
            const reader = new FileReader();
    
            reader.onload = function(e) {
                image.src = e.target.result;
    
                // Once the image is loaded, resize it
                image.onload = function() {
                    resizeImage(image).then((resizedCanvas) => {
                        // Define the ROI (example: x, y, width, height)
                        const roi = {
                            x: 100,
                            y: 250, 
                            width: 400,
                            height: 700 
                        };
    
                        // Crop the image based on the ROI
                        cropROI(resizedCanvas, roi).then((croppedImageUrl) => {
                            // Convert cropped image URL to Blob
                            const croppedImageBlob = dataURLToBlob(croppedImageUrl);
    
                            // Preprocess the cropped image
                            preprocessImage(croppedImageBlob, function(processedImageUrl) {

                                // <--- Display Image ---> //
                                $('#croppedImage').attr('src', processedImageUrl).show();

                            // Proceed with OCR processing using the cropped image URL
                            Tesseract.recognize(
                                processedImageUrl,
                                'eng',
                                {   
                                    // <--- Progress of OCR ---> //
                                    //logger: (m) => console.log(`Progress: ${Math.round(m.progress * 100)}% - ${m.status}`),  // Log OCR progress
                                    tessedit_ocr_engine_mode: 1  // Use LSTM OCR engine (OEM 1)
                                }
                            ).then(({ data: { text } }) => {
                                console.log('Extracted Text:', text); // Log extracted text
    
                                $('#spinnerContainer').hide();
                                $('#ocrResultContainer').show();
    
                                // Fetch subjects and match them
                                fetchSubjects().then(function(subjects) {
                                    const matchedSubjects = matchSubjects(text, subjects);
                                    displayMatchedSubjects(matchedSubjects); // Display the matched subjects
                                });
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

    function preprocessImage(imageFile, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
    
        img.onload = function() {
            // Resize image
            canvas.width = img.width * 10; // Increase width by a factor of 10
            canvas.height = img.height * 10; // Increase height by a factor of 10
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
            const threshold = 20; // Adjust this threshold as needed
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
        
});