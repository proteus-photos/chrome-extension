// Function to create magnifier icon
function createMagnifierIcon() {
    const magnifier = document.createElement('div');
    magnifier.className = 'image-magnifier';
    magnifier.innerHTML = '🔍';
    return magnifier;
}

// Function to call the API for perceptual hashing via background script
async function callHashAPI(imageData) {
  try {    
    console.info('[callHashAPI] Called with imageData');
    
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "callHashAPI", imageData: imageData },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[callHashAPI] Error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }
          
          if (response && response.success) {
            console.info('[callHashAPI] Response data:', response.data);
            if (response.data && response.data.phash) {
              resolve(response.data.phash);
            } else {
              reject(new Error('Invalid response format: phash not found'));
            }
          } else {
            reject(new Error(response.error || 'Unknown error in API call'));
          }
        }
      );
    });
  } catch (error) {
    console.error('[callHashAPI] Error:', error);
    throw error;
  }
}

// Function to safely get image information without using canvas
function getImageInfo(img) {
  console.info('[getImageInfo] Getting info for image:', img.src);
  
  return new Promise(async (resolve) => {
    let phash = 'Calculating...';
    
    try {
      // Simply pass the image source URL to the background script
      phash = await callHashAPI(img.src);
    } catch (error) {
      console.error('[getImageInfo] Error getting pHash:', error);
      phash = 'Error calculating pHash';
    }
    
    const info = {
      src: img.src,
      alt: img.alt || 'No alt text',
      width: img.naturalWidth,
      height: img.naturalHeight,
      fileSize: 'Unknown', // We can't get file size directly
      format: img.src.split('.').pop().split('?')[0].toLowerCase(),
      phash: phash
    };
    
    console.info('[getImageInfo] Final image info:', info);
    resolve(info);
  });
}

// Function to show popup
async function showPopup(imageInfo) {
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
                <p><strong>Perceptual Hash:</strong> <span class="phash-value">${imageInfo.phash}</span></p>
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

        // Add magnifier icon directly to the image's parent
        const magnifier = createMagnifierIcon();
        img.parentNode.appendChild(magnifier);

        // Add click event to magnifier
        magnifier.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const imageInfo = await getImageInfo(img);
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