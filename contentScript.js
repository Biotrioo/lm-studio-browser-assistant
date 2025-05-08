// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeSelection") {
    // Send the selected text to the background to open the popup with pre-filled text
    chrome.runtime.sendMessage({
      action: "openPopupWithText",
      text: request.text
    });
  }
  if (request.action === "summarizeImage") {
    chrome.runtime.sendMessage({
      action: "openPopupWithImage",
      srcUrl: request.srcUrl
    });
  }
}); 