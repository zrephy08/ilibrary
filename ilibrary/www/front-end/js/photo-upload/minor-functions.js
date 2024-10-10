    // Helper function to simulate delay (for progress display)
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Helper function to display error messages
    // PART OF TESTING
    function displayError(message) {
        $('#ocrError').text(message).show();
    }
    
    // Helper function to clear error messages
    // PART OF TESTING
    function clearError() {
        $('#ocrError').hide();
    }
    
    // Helper function to reset result container
    // PART OF TESTING
    function resetResultContainer() {
        $('#ocrResult').text('');
        $('#ocrResultContainer').hide();
    }

    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const reader = new FileReader();
    
            reader.onload = function(e) {
                image.src = e.target.result;
                image.onload = () => resolve(image);
                image.onerror = reject;
            };
    
            reader.readAsDataURL(file);
        });
    }