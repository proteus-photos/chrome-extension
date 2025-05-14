// Background script for handling API requests
const API_CONFIG = {
  baseUrl: "http://localhost:3001",
  endpoints: {
    hash: "/api/dinohash"
  }
};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "callHashAPI") {
    // Extract the image URL from the request
    const imageUrl = request.imageData;
    
    // Process the image and make the API call
    processImageAndCallAPI(imageUrl)
      .then(result => {
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error("Error in API call:", error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});

// Function to download image and call the API
async function processImageAndCallAPI(imageUrl) {
  try {
    console.log("Processing image URL:", imageUrl);
    
    // Download the image first
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    
    // Create FormData object
    const formData = new FormData();
    
    // Add image to FormData
    formData.append('image', imageBlob, 'image.jpg');
    
    // Determine MIME type
    let mimeType = imageBlob.type || 'image/jpeg';
    formData.append('type', mimeType);
    
    console.log("Sending request to API with content type:", mimeType);
    
    // Make the API call
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.hash}`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
} 