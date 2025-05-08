LM Studio Browser Assistant

LM Studio Browser Assistant is a lightweight browser extension designed to seamlessly integrate with LM Studio, enabling users to interact with local Large Language Models (LLMs) directly from their web browser. This tool enhances productivity by allowing quick access to AI-powered assistance without leaving your current webpage.
Features

    🔗 Seamless Integration: Connects effortlessly with LM Studio's local server to utilize LLM capabilities.

    🌐 Cross-Browser Support: Compatible with modern browsers like Firefox and Chrome.

    🧠 Contextual Assistance: Provides AI-generated responses based on the content of the current webpage.

    ⚙️ Customizable Settings: Adjust parameters such as model selection, temperature, and max tokens to tailor responses.

    🛡️ Privacy-Focused: All data processing occurs locally, ensuring user privacy and data security.

Installation
Prerequisites

    LM Studio: Ensure LM Studio is installed and running on your machine. You can download it from the official website.

    Supported Browser: A modern web browser like Firefox or Chrome.

Steps

    Clone the Repository:

    git clone https://github.com/Biotrioo/lm-studio-browser-assistant.git

    Load the Extension:

        For Chrome/Edge:

            Navigate to chrome://extensions/ in your browser.

            Enable "Developer mode" (toggle in the top right corner).

            Click on "Load unpacked" and select the cloned repository folder.

        For Firefox:

            Navigate to about:debugging#/runtime/this-firefox in your browser.

            Click on "Load Temporary Add-on" and select the manifest.json file from the cloned repository.

Usage

    Start LM Studio:

        Open LM Studio on your machine.

        Ensure the local server is running. You can start it from the "Developer" tab by enabling the server.

    Configure the Extension:

        Click on the extension icon in your browser toolbar.

        Enter the LM Studio server address (e.g., http://localhost:1234).

        Adjust settings like model selection, temperature, and max tokens as desired.

    Interact with the Assistant:

        Highlight text on any webpage and click the extension icon to get AI-generated insights.

        Use the popup interface to input queries and receive responses from the local LLM.

Development
Project Structure

    manifest.json: Extension manifest file defining permissions and background scripts.

    background.js: Handles background processes and communication with LM Studio.

    contentScript.js: Injected into webpages to interact with page content.

    popup.html: Defines the extension's popup UI.

    popup.js: Manages user interactions within the popup.

    icons/: Contains extension icons.

Building the Extension

If you make changes to the source code:

    Update the Manifest:

        Ensure any new scripts or permissions are declared in manifest.json.

    Reload the Extension:

        For Chrome/Edge: Go to chrome://extensions/, find the extension, and click "Reload".

        For Firefox: Go to about:debugging#/runtime/this-firefox, find the extension, and click "Reload".

Contributions are welcome! Please fork the repository and submit a pull request with your enhancements or bug fixes. For major changes, open an issue first to discuss what you would like to change.

This project is licensed under the MIT License.
