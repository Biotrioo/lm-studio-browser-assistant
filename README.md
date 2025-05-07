# LM Studio Assistant - Firefox Extension

This Firefox extension enables seamless integration with LM Studio(https://lmstudio.ai), providing a **CSP-safe**, standalone window interface to interact with your local language models.

---

## 🚀 Features

- 🔐 **CSP-safe** – Bypasses content restrictions that often block local LLM UIs.
- 🪟 **Popup Window UI** – Clean, resizable, and fixed-window assistant for focused interactions.
- 🧠 **Markdown Rendering** – Uses [Marked.js](https://marked.js.org/) to support rich Markdown output.
- 💾 **Storage Support** – Remembers your last input and state using the `storage` API.
- 🛠️ Works with [LM Studio](https://lmstudio.ai) running locally.

---

## 🧰 Installation

1. **Download** this repository and unzip it.
2. Open `about:debugging` in Firefox.
3. Click **"This Firefox"** → **"Load Temporary Add-on..."**
4. Select the `manifest.json` file from the extracted folder.

> ⚠️ This method is for development/testing only. For permanent use, you’ll need to package and sign the extension.

---

## 💡 Usage

- Click the **extension icon** in your toolbar.
- A popup window will appear, allowing interaction with LM Studio.
- Input is processed and rendered via the local LLM backend.

> You must have **LM Studio running in Dev Mode** locally for this to work.
