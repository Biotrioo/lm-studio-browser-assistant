// Support both MV2 (background page) and MV3 (service worker)
if (typeof chrome.action !== 'undefined') {
  // MV3+ (service worker)
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "openAsTab",
      title: "🧠 Open LM Studio in Tab",
      contexts: ["all"]
    });
    chrome.contextMenus.create({
      id: "summarize-selection",
      title: "Summarize selection with LM Studio",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "summarize-image",
      title: "Summarize image with LM Studio",
      contexts: ["image"]
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openAsTab") {
      chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    }
    if (info.menuItemId === "summarize-selection") {
      chrome.tabs.sendMessage(tab.id, {
        action: "summarizeSelection",
        text: info.selectionText
      });
    }
    if (info.menuItemId === "summarize-image") {
      chrome.tabs.sendMessage(tab.id, {
        action: "summarizeImage",
        srcUrl: info.srcUrl
      });
    }
  });

  chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 420,
      height: 800
    });
  });

  // Listen for messages from contentScript.js to open popup with context
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openPopupWithText") {
      chrome.storage.local.set({ contextText: request.text }, () => {
        if (chrome.action && chrome.action.openPopup) {
          chrome.action.openPopup();
        }
      });
    }
    if (request.action === "openPopupWithImage") {
      chrome.storage.local.set({ contextImage: request.srcUrl }, () => {
        if (chrome.action && chrome.action.openPopup) {
          chrome.action.openPopup();
        }
      });
    }
  });
} else {
  // MV2 (background page)
  chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
      id: "openAsTab",
      title: "🧠 Open LM Studio in Tab",
      contexts: ["all"]
    });
    chrome.contextMenus.create({
      id: "summarize-selection",
      title: "Summarize selection with LM Studio",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "summarize-image",
      title: "Summarize image with LM Studio",
      contexts: ["image"]
    });
  });

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "openAsTab") {
      chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    }
    if (info.menuItemId === "summarize-selection") {
      chrome.tabs.sendMessage(tab.id, {
        action: "summarizeSelection",
        text: info.selectionText
      });
    }
    if (info.menuItemId === "summarize-image") {
      chrome.tabs.sendMessage(tab.id, {
        action: "summarizeImage",
        srcUrl: info.srcUrl
      });
    }
  });

  chrome.browserAction.onClicked.addListener(function() {
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 420,
      height: 800
    });
  });

  // Listen for messages from contentScript.js to open popup with context
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openPopupWithText") {
      chrome.storage.local.set({ contextText: request.text }, () => {
        if (chrome.action && chrome.action.openPopup) {
          chrome.action.openPopup();
        }
      });
    }
    if (request.action === "openPopupWithImage") {
      chrome.storage.local.set({ contextImage: request.srcUrl }, () => {
        if (chrome.action && chrome.action.openPopup) {
          chrome.action.openPopup();
        }
      });
    }
  });
}