function preprocessImage(imageFile) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            // Resize image
            canvas.width = img.width * 10;
            canvas.height = img.height * 10;
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
            const threshold = 15; // Adjust this threshold as needed
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

            // Resolve the promise with the processed image as a Data URL
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = function(error) {
            // Reject the promise in case of error
            reject(error);
        };

        img.src = URL.createObjectURL(imageFile);
    });
}
