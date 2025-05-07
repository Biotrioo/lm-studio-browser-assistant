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

chrome.browserAction.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 420,
    height: 800
  });
});