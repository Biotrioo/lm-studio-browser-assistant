// Support both MV2 (background page) and MV3 (service worker)
if (typeof chrome.action !== 'undefined') {
  // MV3+ (service worker)
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "openAsTab",
      title: "🧠 Open LM Studio in Tab",
      contexts: ["all"]
    });
  });

  chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "openAsTab") {
      chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
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
} else {
  // MV2 (background page)
  chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
      id: "openAsTab",
      title: "🧠 Open LM Studio in Tab",
      contexts: ["all"]
    });
  });

  chrome.contextMenus.onClicked.addListener(function(info) {
    if (info.menuItemId === "openAsTab") {
      chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
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
}