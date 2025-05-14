// Function to create magnifier icon
function createMagnifierIcon() {
    const magnifier = document.createElement('div');
    magnifier.className = 'image-magnifier';
    magnifier.innerHTML = '🔍';
    return magnifier;
}

// Function to get image information
function getImageInfo(img) {
    return {
        src: img.src,
        alt: img.alt || 'No alt text',
        width: img.naturalWidth,
        height: img.naturalHeight,
        fileSize: 'Unknown', // We can't get file size directly
        format: img.src.split('.').pop().toLowerCase()
    };
}

// Function to show popup
function showPopup(imageInfo) {
    const popup = document.createElement('div');
    popup.className = 'image-info-popup';
    
    popup.innerHTML = `
        <div class="popup-content">
            <img src="${imageInfo.src}" alt="${imageInfo.alt}" />
            <div class="image-details">
                <h3>Image Information</h3>
                <p><strong>Dimensions:</strong> ${imageInfo.width}x${imageInfo.height}</p>
                <p><strong>Format:</strong> ${imageInfo.format}</p>
                <p><strong>Alt Text:</strong> ${imageInfo.alt}</p>
                <button class="close-popup">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Close popup when clicking the close button
    popup.querySelector('.close-popup').addEventListener('click', () => {
        popup.remove();
    });

    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// Main function to process images
function processImages() {
    const images = document.getElementsByTagName('img');
    
    Array.from(images).forEach(img => {
        // Skip if image already has a magnifier
        if (img.parentElement.querySelector('.image-magnifier')) return;

        // Create container for image and magnifier
        const container = document.createElement('div');
        container.className = 'image-container';
        
        // Insert container before image
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);

        // Add magnifier icon
        const magnifier = createMagnifierIcon();
        container.appendChild(magnifier);

        // Add click event to magnifier
        magnifier.addEventListener('click', () => {
            const imageInfo = getImageInfo(img);
            showPopup(imageInfo);
        });
    });
}

// Run when page loads
processImages();

// Run when new images are added to the page
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            processImages();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
}); 