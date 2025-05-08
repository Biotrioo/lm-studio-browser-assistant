document.addEventListener("DOMContentLoaded", () => {
  console.log("popup.js loaded and DOMContentLoaded fired");

  // Default prompt templates (ensure this is defined before any use)
  const defaultPrompts = {
    summarize: "Summarize the following text in 3 concise bullet points. Focus on the most important facts.",
    explain: "Explain the following text in simple, clear language suitable for a beginner.",
    action: "Extract all actionable tasks or to-dos from the following text. List each as a bullet point.",
    qa: "Based on the following text, answer the user's question as clearly and accurately as possible."
  };

  const STORAGE_KEY = "lmstudio_chat_history";
  const MAX_TURNS = 20;
  let chatHistory = [];
  let livePreview = true;
  let previewMode = false;

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
  const themeToggle = document.getElementById("themeToggle");
  const liveToggle = document.getElementById("liveToggle");
  const clearBtn = document.getElementById("clearBtn");

  // Theme toggle
  function setTheme(light) {
    document.body.classList.toggle("light", light);
    themeToggle.textContent = light ? "☀️" : "🌙";
    localStorage.setItem("theme", light ? "light" : "dark");
  }
  themeToggle.addEventListener("click", () => {
    console.log("Theme toggle clicked");
    setTheme(!document.body.classList.contains("light"));
  });
  // Load theme
  setTheme(localStorage.getItem("theme") === "light");

  // Live/preview switch
  function updateLiveToggle() {
    liveToggle.textContent = previewMode ? "✏️" : "👁️";
    liveToggle.title = previewMode ? "Switch to live preview" : "Switch to preview-only mode";
    input.style.display = previewMode ? "none" : "";
    output.setAttribute("aria-label", previewMode ? "Markdown preview (output only)" : "Markdown preview");
  }
  liveToggle.addEventListener("click", () => {
    console.log("Live toggle clicked");
    previewMode = !previewMode;
    updateLiveToggle();
    if (previewMode) {
      // Show only output
      output.classList.remove("fade", "out");
    } else {
      // Show both
      renderLivePreview();
    }
  });
  updateLiveToggle();

  // Clear/reset button
  clearBtn.addEventListener("click", () => {
    console.log("Clear button clicked");
    input.value = "";
    output.innerHTML = "<i>Cleared.</i>";
    output.classList.add("fade");
    setTimeout(() => output.classList.remove("fade"), 300);
  });

  // Live preview logic
  function renderLivePreview() {
    if (previewMode) return;
    output.classList.add("fade", "out");
    setTimeout(() => {
      output.innerHTML = DOMPurify.sanitize(marked.parse(input.value));
      output.classList.remove("out");
    }, 120);
  }
  input.addEventListener("input", () => {
    if (livePreview && !previewMode) renderLivePreview();
  });

  // Keyboard accessibility: Ctrl+Enter to send, Esc to clear
  input.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      sendBtn.click();
    } else if (e.key === "Escape") {
      clearBtn.click();
    }
  });

  sendBtn?.addEventListener("click", () => {
    console.log("Send button clicked");
    const userText = input.value.trim();
    if (!userText) return;
    input.value = "";

    const mode = document.getElementById("model").value;
    let systemPrompt = "You are a helpful assistant.";
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
      output.innerHTML = DOMPurify.sanitize(marked.parse(answer));
      output.scrollTop = output.scrollHeight;
    })
    .catch(err => {
      output.innerHTML = "❌ Error: " + err.message;
    });
  });

  regenBtn?.addEventListener("click", () => {
    console.log("Regenerate button clicked");
    const lastUser = [...chatHistory].reverse().find(msg => msg.role === "user");
    if (lastUser) {
      input.value = lastUser.content;
      sendBtn.click();
    }
  });

  newChatBtn?.addEventListener("click", () => {
    console.log("New Chat button clicked");
    chatHistory = [];
    saveMemory();
    output.innerHTML = "<i>🧠 New conversation started.</i>";
  });

  // Helper to detect Manifest V3
  function isMV3() {
    return chrome.runtime.getManifest && chrome.runtime.getManifest().manifest_version === 3;
  }

  function executeScriptCompat(tabs, func, callback) {
    console.log('All tabs from query:', tabs.map(t => t.url));
    // Only allow http(s) tabs
    const scriptableTabs = tabs.filter(tab => tab.url && tab.url.startsWith('http'));
    console.log('Scriptable tabs:', scriptableTabs.map(t => t.url));
    output.innerHTML = `<i>Found ${tabs.length} tabs, ${scriptableTabs.length} scriptable (http/https) tabs.</i>`;
    if (scriptableTabs.length === 0) {
      output.innerHTML = '<i>No scriptable (http/https) tabs found. Please open at least one regular website tab.</i>';
      console.warn('No scriptable (http/https) tabs found:', tabs.map(t => t.url));
      callback([]);
      return;
    }
    let callbackFired = false;
    if (isMV3() && chrome.scripting && chrome.scripting.executeScript) {
      // MV3+
      const tabIds = scriptableTabs.map(tab => tab.id);
      chrome.scripting.executeScript({
        target: { tabIds },
        func
      }, (results) => {
        callbackFired = true;
        output.innerHTML += `<br>MV3 callback fired. Results: ${JSON.stringify(results, null, 2)}`;
        console.log('MV3 executeScript callback:', results);
        callback(results);
      });
    } else {
      // MV2/Firefox
      let results = [];
      let completed = 0;
      const total = scriptableTabs.length;
      let timeoutFired = false;
      scriptableTabs.forEach((tab, i) => {
        chrome.tabs.executeScript(tab.id, {
          code: '(' + func.toString() + ')();'
        }, (result) => {
          if (chrome.runtime.lastError) {
            console.warn('Script injection failed for tab', tab.id, tab.url, chrome.runtime.lastError.message);
            results[i] = undefined;
          } else {
            results[i] = result && result[0];
          }
          completed++;
          output.innerHTML = `<i>Processed ${completed}/${total} tabs...</i>`;
          if (completed === total && !timeoutFired) {
            callbackFired = true;
            console.log('All tabs responded to executeScript.', results);
            output.innerHTML += `<br>All tabs responded. Debug: ${JSON.stringify(results, null, 2)}`;
            callback(results.map((r, idx) => ({ tabId: scriptableTabs[idx].id, result: r })));
          }
        });
      });
      // Timeout fallback
      setTimeout(() => {
        if (completed < total) {
          timeoutFired = true;
          output.innerHTML = '<i>Timeout: Not all tabs responded to script injection.<br>Debug info: ' + JSON.stringify(results, null, 2) + '</i>';
          console.warn('Timeout: Not all tabs responded to executeScript', results);
          callback(results.map((r, idx) => ({ tabId: scriptableTabs[idx].id, result: r })));
        }
        if (!callbackFired) {
          output.innerHTML += '<br><b>ERROR: Callback never fired!</b>';
          console.error('ERROR: Callback never fired!');
        }
      }, 2000); // 2 seconds for testing
    }
  }

  // --- Custom Prompt Management ---
  const managePromptsModal = document.getElementById("managePromptsModal");
  const customPromptsList = document.getElementById("customPromptsList");
  const newPromptName = document.getElementById("newPromptName");
  const newPromptTemplate = document.getElementById("newPromptTemplate");
  const addPromptBtn = document.getElementById("addPromptBtn");
  const managePromptsCancel = document.getElementById("managePromptsCancel");
  const promptPresetDropdown = document.getElementById("promptPreset");

  // Defensive element selection
  function getEl(id) {
    const el = document.getElementById(id);
    if (!el) {
      console.error('Element not found:', id);
    }
    return el;
  }

  // Load custom prompts from storage
  function loadCustomPrompts(cb) {
    console.log("[DEBUG] loadCustomPrompts called");
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(["customPrompts"], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error loading custom prompts:', chrome.runtime.lastError);
          const output = document.getElementById("output");
          if (output) output.innerHTML = '<span style="color:orange">⚠️ Failed to load custom prompts: ' + chrome.runtime.lastError.message + '</span>';
          cb([]);
        } else {
          console.log('[DEBUG] Loaded custom prompts:', result.customPrompts);
          cb(Array.isArray(result.customPrompts) ? result.customPrompts : []);
        }
      });
    } else {
      console.warn("[DEBUG] chrome.storage.sync not available in loadCustomPrompts");
      cb([]);
    }
  }

  // Save custom prompts to storage
  function saveCustomPrompts(prompts, cb) {
    console.log("[DEBUG] saveCustomPrompts called", prompts);
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ customPrompts: prompts }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving custom prompts:', chrome.runtime.lastError);
          const output = document.getElementById("output");
          if (output) output.innerHTML = '<span style="color:orange">⚠️ Failed to save custom prompts: ' + chrome.runtime.lastError.message + '</span>';
        } else {
          console.log('[DEBUG] Saved custom prompts:', prompts);
        }
        if (cb) cb();
      });
    } else {
      console.warn("[DEBUG] chrome.storage.sync not available in saveCustomPrompts");
      if (cb) cb();
    }
  }

  // Render custom prompts in dropdown
  function renderCustomPromptsDropdown(prompts) {
    // Remove all custom prompt options
    Array.from(promptPresetDropdown.options).forEach(opt => {
      if (opt.dataset && opt.dataset.customPrompt) promptPresetDropdown.removeChild(opt);
    });
    // Insert custom prompts before the 'Manage Prompts…' option
    const manageIdx = Array.from(promptPresetDropdown.options).findIndex(opt => opt.value === "manage");
    prompts.forEach((p, i) => {
      const opt = document.createElement("option");
      opt.value = "custom_" + i;
      opt.textContent = p.name;
      opt.dataset.customPrompt = "1";
      promptPresetDropdown.insertBefore(opt, promptPresetDropdown.options[manageIdx]);
    });
  }

  // Render custom prompts in modal
  function renderCustomPromptsList(prompts) {
    customPromptsList.innerHTML = "";
    prompts.forEach((p, i) => {
      const div = document.createElement("div");
      div.style = "display:flex;align-items:center;gap:8px;margin-bottom:4px;";
      div.innerHTML = `<b style='color:#fff;'>${p.name}</b> <span style='flex:1;color:#aaa;font-size:13px;'>${p.template.slice(0, 40)}${p.template.length > 40 ? '…' : ''}</span>`;
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style = "background:#e74c3c;color:#fff;border:none;padding:3px 10px;border-radius:6px;font-size:13px;";
      delBtn.onclick = () => {
        prompts.splice(i, 1);
        saveCustomPrompts(prompts, () => {
          renderCustomPromptsDropdown(prompts);
          renderCustomPromptsList(prompts);
        });
      };
      div.appendChild(delBtn);
      customPromptsList.appendChild(div);
    });
  }

  // Open manage prompts modal
  function openManagePrompts() {
    loadCustomPrompts((prompts) => {
      renderCustomPromptsDropdown(prompts);
      renderCustomPromptsList(prompts);
      newPromptName.value = "";
      newPromptTemplate.value = "";
      managePromptsModal.style.display = "flex";
    });
  }

  // Add new custom prompt
  addPromptBtn.onclick = () => {
    const name = newPromptName.value.trim();
    const template = newPromptTemplate.value.trim();
    if (!name || !template) return;
    loadCustomPrompts((prompts) => {
      prompts.push({ name, template });
      saveCustomPrompts(prompts, () => {
        renderCustomPromptsDropdown(prompts);
        renderCustomPromptsList(prompts);
        newPromptName.value = "";
        newPromptTemplate.value = "";
      });
    });
  };
  managePromptsCancel.onclick = () => {
    managePromptsModal.style.display = "none";
  };

  // Dropdown change logic
  promptPresetDropdown.addEventListener("change", () => {
    const val = promptPresetDropdown.value;
    console.log("[DEBUG] Prompt preset changed to", val);
    if (val === "manage") {
      openManagePrompts();
      promptPresetDropdown.value = "summarize";
      return;
    }
    if (val.startsWith("custom_")) {
      loadCustomPrompts((prompts) => {
        const idx = parseInt(val.split("_")[1], 10);
        if (prompts[idx]) input.value = prompts[idx].template;
      });
    } else {
      input.value = defaultPrompts[val];
    }
  });

  // On load, render custom prompts
  loadCustomPrompts((prompts) => {
    renderCustomPromptsDropdown(prompts);
    console.log("[DEBUG] Custom prompts dropdown rendered", prompts);
    // Set default prompt and input value after rendering
    promptPresetDropdown.value = "summarize";
    input.value = defaultPrompts["summarize"];
  });

  // Update getCurrentPromptTemplate to support custom prompts
  function getCurrentPromptTemplate(cb) {
    const val = promptPresetDropdown.value;
    if (val.startsWith("custom_")) {
      loadCustomPrompts((prompts) => {
        const idx = parseInt(val.split("_")[1], 10);
        cb(prompts[idx] ? prompts[idx].template : "");
      });
    } else if (val === "manage") {
      cb(defaultPrompts["summarize"]);
    } else {
      cb(defaultPrompts[val]);
    }
  }

  // --- Output Pane Actions & Feedback ---
  const outputPane = document.querySelector('.output-card');
  const outputHeader = document.querySelector('.output-header');
  const outputDiv = getEl('output');
  const copyOutputBtn = getEl('copyOutputBtn');
  const exportOutputBtn = getEl('exportOutputBtn');
  const collapseOutputBtn = getEl('collapseOutputBtn');
  const toast = getEl('toast');

  if (!outputDiv || !copyOutputBtn || !exportOutputBtn || !collapseOutputBtn || !toast || !promptPresetDropdown || !input) {
    console.error('Critical UI elements missing. Aborting script.');
    return;
  }

  // Ripple effect for microinteractions
  document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('mousedown', function(e) {
      btn.classList.add('ripple');
      setTimeout(() => btn.classList.remove('ripple'), 400);
    });
  });

  // Copy output
  copyOutputBtn.onclick = () => {
    console.log("Copy Output button clicked");
    navigator.clipboard.writeText(outputDiv.innerText);
    showToast('Output copied!');
  };
  // Export output as Markdown
  exportOutputBtn.onclick = () => {
    console.log("Export Output button clicked");
    const blob = new Blob([outputDiv.innerText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as Markdown!');
  };
  // Collapse/expand output
  let outputCollapsed = false;
  collapseOutputBtn.onclick = () => {
    console.log("Collapse Output button clicked");
    outputCollapsed = !outputCollapsed;
    outputPane.classList.toggle('output-collapsed', outputCollapsed);
    collapseOutputBtn.innerText = outputCollapsed ? '▶️' : '🔽';
  };

  // Toast notification
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }

  // Spinner feedback
  function showSpinner() {
    outputDiv.innerHTML = '<span class="spinner"></span>';
  }

  // --- Ensure Summarize and Deep Research use spinner and correct prompt ---
  document.getElementById("summarize").addEventListener("click", () => {
    console.log("[DEBUG] Summarize This Page button clicked");
    showSpinner();
    chrome.tabs.query({ lastFocusedWindow: true }, (tabs) => {
      const realTab = tabs.find(tab => tab.url && tab.url.startsWith('http'));
      if (!realTab) {
        outputDiv.innerHTML = "❌ Could not find a valid website tab.";
        return;
      }
      executeScriptCompat([realTab], function() {
        return document.body.innerText;
      }, (results) => {
        const pageText = results?.[0]?.result || "❌ No readable text.";
        if (!pageText || pageText.length < 1) {
          outputDiv.innerHTML = "<i>No readable text found on this page.<br>Debug info: " + JSON.stringify(results, null, 2) + "</i>";
          return;
        }
        getCurrentPromptTemplate((template) => {
          const summaryPrompt = `${template}\n\n${pageText}`;
          input.value = summaryPrompt;
          outputDiv.innerHTML = '<span class="spinner"></span>';
          document.getElementById("send").click();
        });
      });
    });
  });

  // Deep Research UI logic (fix for Firefox)
  const deepResearchBtn = document.getElementById("deepResearch");
  const deepResearchModal = document.getElementById("deepResearchModal");
  const deepResearchInput = document.getElementById("deepResearchInput");
  const deepResearchGo = document.getElementById("deepResearchGo");
  const deepResearchCancel = document.getElementById("deepResearchCancel");

  deepResearchBtn.addEventListener("click", () => {
    console.log("[DEBUG] Deep Research button clicked");
    deepResearchInput.value = "";
    deepResearchModal.style.display = "flex";
    deepResearchInput.focus();
  });
  deepResearchCancel.addEventListener("click", () => {
    console.log("[DEBUG] Deep Research Cancel button clicked");
    deepResearchModal.style.display = "none";
  });
  deepResearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      console.log("[DEBUG] Deep Research input Enter pressed");
      deepResearchGo.click();
    }
    if (e.key === "Escape") {
      console.log("[DEBUG] Deep Research input Escape pressed");
      deepResearchCancel.click();
    }
  });
  deepResearchGo.addEventListener("click", () => {
    console.log("[DEBUG] Deep Research Go button clicked");
    const question = deepResearchInput.value.trim();
    if (!question) return;
    deepResearchModal.style.display = "none";
    showSpinner();
    chrome.tabs.query({}, (tabs) => {
      executeScriptCompat(tabs, function() {
        return {
          url: window.location.href,
          title: document.title,
          text: document.body.innerText.slice(0, 20000)
        };
      }, (results) => {
        const validResults = (results || []).filter(r => r && r.result && r.result.text && r.result.text.length > 1);
        if (validResults.length === 0) {
          outputDiv.innerHTML = "<i>No usable content found in open tabs.<br>Debug info: " + JSON.stringify(results, null, 2) + "</i>";
          return;
        }
        let context = validResults.map(r => `# ${r.result.title}\nURL: ${r.result.url}\n${r.result.text}`).join("\n\n---\n\n");
        getCurrentPromptTemplate((template) => {
          const prompt = `${template}\n\n${context}`;
          outputDiv.innerHTML = '<span class="spinner"></span>';
          fetch("http://localhost:1234/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                { role: "system", content: "You are a research assistant that synthesizes information from multiple sources." },
                { role: "user", content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 1024
            })
          })
          .then(res => res.json())
          .then(data => {
            const answer = data.choices[0].message.content;
            outputDiv.innerHTML = DOMPurify.sanitize(marked.parse(answer));
            outputDiv.scrollTop = outputDiv.scrollHeight;
          })
          .catch(err => {
            outputDiv.innerHTML = "❌ Error: " + err.message;
          });
        });
      });
    });
  });

  // Pre-fill input if opened from context menu (selection or image)
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["contextText", "contextImage"], (data) => {
      if (data.contextText) {
        input.value = data.contextText;
        chrome.storage.local.remove("contextText");
      }
      if (data.contextImage) {
        // Insert as markdown image link
        input.value = `![Image from page](${data.contextImage})`;
        chrome.storage.local.remove("contextImage");
      }
    });
  }

  console.log("[DEBUG] All event handlers attached");
});