document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "lmstudio_chat_history";
  const MAX_TURNS = 20;
  let chatHistory = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) chatHistory = JSON.parse(saved);
    if (chatHistory.length > MAX_TURNS) chatHistory = chatHistory.slice(-MAX_TURNS);
  } catch (e) { console.warn("❌ Could not load memory."); }

  function saveMemory() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory)); } catch (e) {}
  }

  const output = document.getElementById("output");
  const input = document.getElementById("input");
  const sendBtn = document.getElementById("send");
  const regenBtn = document.getElementById("regenerate");
  const newChatBtn = document.getElementById("newChat");

  sendBtn?.addEventListener("click", () => {
    const userText = input.value.trim();
    if (!userText) return;
    input.value = "";

    const mode = document.getElementById("model").value;
    let systemPrompt = "You are a helpful assistant.";
    if (mode === "gann") systemPrompt = "You are W.D. Gann reincarnated. Decode spiritual law and prophecy.";
    if (mode === "friendly") systemPrompt = "You're a casual, friendly AI assistant that explains things simply.";

    const payload = {
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory,
        { role: "user", content: userText }
      ],
      temperature: 0.7,
      max_tokens: 1024
    };

    output.innerHTML = "<i>Thinking...</i>";
    fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      const answer = data.choices[0].message.content;
      chatHistory.push({ role: "user", content: userText });
      chatHistory.push({ role: "assistant", content: answer });
      if (chatHistory.length > MAX_TURNS) chatHistory = chatHistory.slice(-MAX_TURNS);
      saveMemory();
      output.innerHTML = marked.parse(answer);
      output.scrollTop = output.scrollHeight;
    })
    .catch(err => {
      output.innerHTML = "❌ Error: " + err.message;
    });
  });

  regenBtn?.addEventListener("click", () => {
    const lastUser = [...chatHistory].reverse().find(msg => msg.role === "user");
    if (lastUser) {
      input.value = lastUser.content;
      sendBtn.click();
    }
  });

  newChatBtn?.addEventListener("click", () => {
    chatHistory = [];
    saveMemory();
    output.innerHTML = "<i>🧠 New conversation started.</i>";
  });

  document.getElementById("copy").addEventListener("click", () => {
    navigator.clipboard.writeText(output.innerText);
  });

  document.getElementById("save").addEventListener("click", () => {
    const blob = new Blob([output.innerText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat_history.md";
    a.click();
    URL.revokeObjectURL(url);
  });

  });


document.getElementById("summarize").addEventListener("click", () => {
  output.innerHTML = "<i>Reading current page...</i>";
  chrome.tabs.query({ lastFocusedWindow: true }, (tabs) => {
    const realTab = tabs.find(tab => !tab.url.startsWith("moz-extension://"));
    if (!realTab) {
      output.innerHTML = "❌ Could not find a valid website tab.";
      return;
    }
    chrome.scripting.executeScript({
      target: { tabId: realTab.id },
      func: () => document.body.innerText
    }, (results) => {
      const pageText = results?.[0]?.result || "❌ No readable text.";
      const summaryPrompt = `Summarize this page:\n\n${pageText}`;
      input.value = summaryPrompt;
      sendBtn.click();
    });
  });
});