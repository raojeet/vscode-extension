/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(__webpack_require__(1));
const panel_1 = __webpack_require__(2);
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {
// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "smartq" is now active!');
// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	const disposable = vscode.commands.registerCommand('smartq.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from smartQ!');
// 	});
// 	context.subscriptions.push(disposable);
// }
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('smartq.openTestCaseGenerator', () => {
        panel_1.TestCasePanel.createOrShow(context);
    }));
}
// This method is called when your extension is deactivated
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestCasePanel = void 0;
const vscode = __importStar(__webpack_require__(1));
class TestCasePanel {
    static currentPanel;
    static createOrShow(context) {
        const panel = vscode.window.createWebviewPanel("testCaseGenerator", "Test Case Generator", vscode.ViewColumn.One, {
            enableScripts: true,
        });
        panel.webview.html = this.getWebviewContent();
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === "generateTestCases") {
                try {
                    const testCases = await this.generateTestCases(message.model, message.fileName
                        ? new File([message.fileName], message.fileName)
                        : null, message.performRefactoring, message.maxRefactoring);
                    // Once test cases are generated, you can handle the result as needed
                    panel.webview.postMessage({
                        command: "showMessage",
                        text: "Test cases generated successfully!",
                    });
                }
                catch (error) {
                    const errorMessage = error.message || 'An unknown error occurred';
                    panel.webview.postMessage({
                        command: "showMessage",
                        text: `Failed to generate test cases: ${errorMessage}`,
                    });
                }
            }
        });
    }
    static getWebviewContent() {
        return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Case Generator</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                  padding: 0;
              }
              select, button, input[type="file"], input[type="number"] {
                  padding: 10px;
                  margin: 5px 0;
                  font-size: 16px;
              }
              .message {
                  margin-top: 20px;
                  color: green;
              }
              .error {
                  color: red;
              }
              .form-group {
                  margin-bottom: 15px;
              }
              label {
                  font-weight: bold;
              }
          </style>
      </head>
      <body>
          <h2>Generate Test Cases</h2>

          <!-- Dropdown to select model -->
          <div class="form-group">
              <label for="modelSelect">Choose Model:</label>
              <select id="modelSelect">
                  <option value="gpt-3">GPT-3</option>
                  <option value="gpt-4">GPT-4</option>
              </select>
          </div>

          <!-- File input for uploading a file -->
          <div class="form-group">
              <label for="fileInput">Upload File:</label>
              <input type="file" id="fileInput" />
          </div>

          <!-- Checkbox for refracting -->
          <div class="form-group">
              <label for="refactoringCheckbox">Perform Refactoring:</label>
              <input type="checkbox" id="refactoringCheckbox" />
          </div>

          <!-- Number input for maximum refactoring number -->
          <div class="form-group">
              <label for="maxRefactoring">Max Refactoring Number:</label>
              <input type="number" id="maxRefactoring" value="0" min="0" disabled />
          </div>

          <!-- Submit button to generate test cases -->
          <button id="generateBtn">Generate Test Cases</button>

          <!-- Message area for feedback -->
          <div id="message" class="message"></div>
  
          <script>
              const vscode = acquireVsCodeApi();

              // Enable/disable max refactoring number input based on checkbox state
              document.getElementById('refactoringCheckbox').addEventListener('change', (event) => {
                  const maxRefactoringInput = document.getElementById('maxRefactoring');
                  maxRefactoringInput.disabled = !event.target.checked; // Disable if checkbox is unchecked
              });

              // On clicking the generate button
            document.getElementById('generateBtn').addEventListener('click', () => {
                const model = document.getElementById('modelSelect').value;
                const file = document.getElementById('fileInput').files[0];  // Get the selected file
                const performRefactoring = document.getElementById('refactoringCheckbox').checked;
                const maxRefactoring = document.getElementById('maxRefactoring').value;

                // Clear previous messages
                document.getElementById('message').textContent = ''; 

                // Prepare the message to send to the backend
                const payload = {
                    command: 'generateTestCases',
                    model,
                    fileName: file ? file.name : null,  // Include file name if selected
                    performRefactoring,
                    maxRefactoring: performRefactoring ? maxRefactoring : null  // Only send if refactoring is enabled
                };

                vscode.postMessage(payload);
            });

              // Handle messages from the extension
              window.addEventListener('message', event => {
                  const message = event.data;
                  const messageDiv = document.getElementById('message');

                  if (message.command === 'showMessage') {
                      messageDiv.textContent = message.text;
                      messageDiv.className = message.text.startsWith('Failed') ? 'error' : 'message';
                  }
              });
          </script>
      </body>
      </html>`;
    }
    static async generateTestCases(model, file, performRefactoring, maxRefactoring) {
        const apiUrl = "https://your-api-endpoint";
        // Prepare the payload for the API request
        const formData = new FormData();
        formData.append("model", model);
        // Add file if provided
        if (file) {
            formData.append("file", file);
        }
        // Add refactoring options if selected
        if (performRefactoring) {
            formData.append("performRefactoring", "true");
            formData.append("maxRefactoring", maxRefactoring?.toString() || "1");
        }
        else {
            formData.append("performRefactoring", "false");
        }
        const response = await fetch(apiUrl, {
            method: "POST",
            body: formData, // Send the data as multipart/form-data
        });
        if (!response.ok) {
            throw new Error("Failed to generate test cases");
        }
        const data = await response.json();
        return data.testCases;
    }
    static async addTestCasesToProject(testCases) {
        const filePath = vscode.workspace.rootPath + "/testCases.js"; // Adjust the file path as needed
        // Prepare the content to be written
        const content = testCases.join("\n");
        try {
            await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), Buffer.from(content));
            vscode.window.showInformationMessage("Test cases have been added to testCases.js");
        }
        catch (error) {
            const errorMessage = error.message || 'An unknown error occurred';
            vscode.window.showErrorMessage(`Error writing to file: ${errorMessage}`);
        }
    }
}
exports.TestCasePanel = TestCasePanel;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map