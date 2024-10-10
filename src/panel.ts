// src/TestCasePanel.ts
import * as vscode from 'vscode';

export class TestCasePanel {
  // Generate the webview content with two tabs and a settings modal
  public static getWebviewContent(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>smartQa Copilot</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }
            /* Tab styling */
            .tabs {
                overflow: hidden;
                background-color: #f1f1f1;
            }
            .tabs button {
                background-color: inherit;
                float: left;
                border: none;
                outline: none;
                cursor: pointer;
                padding: 14px 16px;
                transition: 0.3s;
                font-size: 17px;
            }
            .tabs button:hover {
                background-color: #ddd;
            }
            .tabs button.active {
                background-color: #ccc;
            }
            /* Tab content */
            .tabcontent {
                display: none;
                padding: 20px;
                border: 1px solid #ccc;
                border-top: none;
            }
            /* Modal styling */
            .modal {
                display: none;
                position: fixed;
                z-index: 1;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgb(0,0,0);
                background-color: rgba(0,0,0,0.4);
                padding-top: 60px;
            }
            .modal-content {
                background-color: #fefefe;
                margin: 5% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
                max-width: 500px;
            }
            .close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }
            .close:hover,
            .close:focus {
                color: black;
                text-decoration: none;
                cursor: pointer;
            }
            .form-group {
                margin-bottom: 15px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            input[type="text"],
            input[type="password"] {
                width: 100%;
                padding: 8px;
                box-sizing: border-box;
            }
            .button-group {
                margin-top: 20px;
            }
            button {
                padding: 10px 15px;
                margin-right: 10px;
                cursor: pointer;
            }
            .message {
                margin-top: 20px;
                color: green;
            }
            .error {
                color: red;
            }
        </style>
    </head>
    <body>
        <!-- Settings Modal -->
        <div id="settingsModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Copilot Settings</h3>
                <div class="form-group">
                    <label for="hostUrl">Host URL:</label>
                    <input type="text" id="hostUrl" placeholder="Enter Host URL">
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="text" id="email" placeholder="Enter Email">
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" placeholder="Enter Password">
                </div>
                <div class="form-group">
                    <label for="pytestDir">Pytest Directory:</label>
                    <input type="text" id="pytestDir" placeholder="Enter Pytest Directory">
                </div>
                <div class="form-group">
                    <label for="pythonFile">Python File:</label>
                    <input type="text" id="pythonFile" placeholder="Enter Python File">
                </div>
                <div class="button-group">
                    <button id="testCoverageBtn">Test Coverage</button>
                    <button id="testCommandBtn">Test Command</button>
                    <button id="clearAllBtn">Clear All</button>
                    <button id="okBtn">Ok</button>
                </div>
                <div id="responseMessage" class="message"></div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
            <button class="tablinks active" id="testGenTab">Test Generator View</button>
            <button class="tablinks" id="utgTab">UTG Agent View</button>
        </div>

        <!-- Tab Content -->
        <div id="utgContent" class="tabcontent">
            <h3>UTG Agent View</h3>
            <!-- UTG Agent specific content -->
        </div>

        <div id="testGenContent" class="tabcontent" style="display: block;">
            <h3>Test Generator View</h3>
            <div class="form-group">
              <label for="modelSelect">Choose Model:</label>
              <select id="modelSelect">
                  <option value="gpt-3">GPT-3</option>
                  <option value="gpt-4">GPT-4</option>
              </select>
            </div>
            <!-- File input for uploading a file -->
            <div class="form-group">
                <label for="fileInput">File Path:</label>
                <input type="text" id="fileInput" name="file" />
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
            <button id="generateTestCasesBtn">Generate Test Cases</button>
            <div id="testGenMessage" class="message"></div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            // Get modal elements
            const settingsModal = document.getElementById('settingsModal');
            const closeModalSpan = document.querySelector('.close');

            // Open the modal
            function openModal() {
                settingsModal.style.display = 'block';
            }

            // Close the modal
            function closeModal() {
                settingsModal.style.display = 'none';
            }

            // When the user clicks on <span> (x), close the modal
            closeModalSpan.onclick = closeModal;

            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function(event) {
                if (event.target == settingsModal) {
                    settingsModal.style.display = 'none';
                }
            }

            // Function to check login status
            async function checkLogin() {
                const accessToken = await vscode.getState('access_token');
                if (!accessToken) {
                    openModal();
                }
            }

            // Initially check login
            checkLogin();

            // Handle Ok button in settings modal
            document.getElementById('okBtn').addEventListener('click', () => {
                const hostUrl = document.getElementById('hostUrl').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const pytestDir = document.getElementById('pytestDir').value;
                const pythonFile = document.getElementById('pythonFile').value;

                if (!hostUrl || !email || !password || !pytestDir || !pythonFile) {
                    document.getElementById('responseMessage').textContent = 'All fields are required.';
                    document.getElementById('responseMessage').className = 'error';
                    return;
                }

                // Send login data to extension
                vscode.postMessage({
                    command: 'login',
                    hostUrl,
                    email,
                    password,
                    pytestDir,
                    pythonFile
                });
            });
            // Enable/disable max refactoring number input based on checkbox state
              document.getElementById('refactoringCheckbox').addEventListener('change', (event) => {
                  const maxRefactoringInput = document.getElementById('maxRefactoring');
                  maxRefactoringInput.disabled = !event.target.checked; // Disable if checkbox is unchecked
              });
            // Handle messages from the extension
            window.addEventListener('message', event => {
                const message = event.data;

                switch (message.command) {
                    case 'loginSuccess':
                        document.getElementById('responseMessage').textContent = message.text;
                        document.getElementById('responseMessage').className = 'message';
                        setTimeout(() => {
                            closeModal();
                        }, 1000);
                        break;
                    case 'loginError':
                        document.getElementById('responseMessage').textContent = message.text;
                        document.getElementById('responseMessage').className = 'error';
                        break;
                    case 'promptLogin':
                        openModal();
                        break;
                    case 'switchTab':
                        switchTab(message.tabId);
                        break;
                    case 'showMessage':
                        document.getElementById('testGenMessage').textContent = message.text;
                        document.getElementById('testGenMessage').className = 'message';
                        break;
                    default:
                     
                }
            });

            // Tab switching functionality
            document.getElementById('utgTab').addEventListener('click', () => {
                vscode.postMessage({ command: 'openTab', tabId: 'utgContent' });
            });

            document.getElementById('testGenTab').addEventListener('click', () => {
                vscode.postMessage({ command: 'openTab', tabId: 'testGenContent' });
            });

            function switchTab(tabId) {
                // Remove active class from all tabs
                document.querySelectorAll('.tablinks').forEach(tab => tab.classList.remove('active'));
                // Add active class to the clicked tab
                if (tabId === 'utgContent') {
                    document.getElementById('utgTab').classList.add('active');
                } else if (tabId === 'testGenContent') {
                    document.getElementById('testGenTab').classList.add('active');
                }

                // Hide all tab contents
                document.querySelectorAll('.tabcontent').forEach(content => content.style.display = 'none');
                // Show the selected tab content
                document.getElementById(tabId).style.display = 'block';
            }
            
            // Function to clear all input fields
              function clearFields() {
                  document.getElementById('hostUrl').value = '';
                  document.getElementById('email').value = '';
                  document.getElementById('password').value = '';
                  document.getElementById('hostUrl').value = '';
                  document.getElementById('pytestDir').value = '';
                  document.getElementById('pythonFile').value = '';
              }

              // Clear All button functionality
              document.getElementById('clearAllBtn').addEventListener('click', () => {
                  clearFields();
              });
            // Handle Generate Test Cases button
            document.getElementById('generateTestCasesBtn').addEventListener('click', () => {
                // check login token
                checkLogin();

                const model = document.getElementById('modelSelect').value;
                const file = document.getElementById('fileInput').value;  // Get the selected file
                const performRefactoring = document.getElementById('refactoringCheckbox').checked;
                const maxRefactoring = document.getElementById('maxRefactoring').value;
                // Clear previous messages
                document.getElementById('testGenMessage').textContent = ''; 

                if (!model || !file) {
                    document.getElementById('testGenMessage').textContent = 'Please fill details';
                    document.getElementById('testGenMessage').className = 'error';
                    return;
                }
                // Prepare the message to send to the backend
                const payload = {
                    command: 'generateTestCases',
                    model,
                    fileName: file,  // Include file name if selected
                    performRefactoring,
                    maxRefactoring: performRefactoring ? maxRefactoring : null  // Only send if refactoring is enabled
                };

                // vscode.postMessage(payload);
                vscode.postMessage({
                    command: 'generateTestCases',
                    model: 'gpt-4',
                    fileName: 'exampleFile.py',
                    performRefactoring: true,
                    maxRefactoring: 2
                });
            });
        </script>
    </body>
    </html>`;
  }

  // Handle login by sending the credentials to the backend
  public static async login(
    email: string,
    password: string,
    hostUrl: string,
    pytestDir: string,
    pythonFile: string
  ): Promise<{ access_token: string }> {
    const apiUrl = `${hostUrl}`; // Assuming the login endpoint 
    const payload = {
      email,
      password,
      hostDir: hostUrl,
      pytestDir,
      pythonFile,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
     body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to log in');
    }

    const data = (await response.json()) as { access_token: string; token_type: string };

    if (!data.access_token) {
      throw new Error('Failed to retrieve access token');
    }

    return data;
  }

  // Generate test cases using the access token
  public static async generateTestCases(
    accessToken: string,
    model: string,
    fileName: string,
    performRefactoring: boolean,
    maxRefactoring: number
  ): Promise<string[]> {
    const apiUrl = 'https://your-api-endpoint/generateTestCases';

    const formData = new FormData();
    formData.append('model', model);
    formData.append('fileName', fileName);
    formData.append('performRefactoring', performRefactoring.toString());
    formData.append('maxRefactoring', maxRefactoring.toString());

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to generate test cases');
    }

    const data = (await response.json()) as { testCases: string[] };
    return data.testCases;
  }

  // Add test cases to the project (e.g., write to a file)
  public static async addTestCasesToProject(testCases: string[]): Promise<void> {
    const filePath = vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath + '/testCases.js'
      : undefined;

    if (!filePath) {
      throw new Error('No workspace folder is open.');
    }

    const content = testCases.join('\n');

    try {
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(filePath),
        Buffer.from(content)
      );
      vscode.window.showInformationMessage('Test cases have been added to testCases.js');
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      vscode.window.showErrorMessage(`Error writing to file: ${errorMessage}`);
    }
  }
}
