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