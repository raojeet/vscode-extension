import * as vscode from 'vscode';

export class TestCasePanel {
  public static currentPanel: TestCasePanel | undefined;

  public static createOrShow(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
      'testCaseGenerator',
      'Test Case Generator',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );

    panel.webview.html = this.getWebviewContent();
    panel.webview.onDidReceiveMessage(async (message) => {
      try {
        switch (message.command) {
          case 'generateTestCases':
            const testCases = await this.generateTestCases(
              message.model,
              message.fileName ? new File([message.fileName], message.fileName) : null,
              message.performRefactoring,
              message.maxRefactoring
            );

            // Once test cases are generated, handle the result
            panel.webview.postMessage({
              command: 'showMessage',
              text: 'Test cases generated successfully!',
            });
            break;

          case 'testConnection':
            // Simulate or call an actual API here for connection test
            const responseMessage = 'Connection Successful!'; // Example response
            panel.webview.postMessage({
              command: 'showResponseMessage',
              text: responseMessage,
            });
            break;

          case 'testMaven':
            // Simulate or call an actual API or function here for Maven test
            const mavenResponse = 'Maven command executed!'; // Example response
            panel.webview.postMessage({
              command: 'showResponseMessage',
              text: mavenResponse,
            });
            break;

          case 'testPytest':
            // Simulate or call an actual API or function here for Pytest test
            const pytestResponse = 'Pytest command executed!'; // Example response
            panel.webview.postMessage({
              command: 'showResponseMessage',
              text: pytestResponse,
            });
            break;

          default:
            throw new Error('Unknown command');
        }
      } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred';
        panel.webview.postMessage({
          command: 'showMessage',
          text: `Failed to process command: ${errorMessage}`,
        });
      }
    });
  }

  private static getWebviewContent() {
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
              /* Styles for tabs */
              .tab {
                  display: inline-block;
                  margin-right: 10px;
                  padding: 10px 20px;
                  cursor: pointer;
                  border: 1px solid #ccc;
                  border-radius: 5px 5px 0 0;
                  background-color: #f1f1f1;
              }
              .tab.active {
                  background-color: #ddd;
              }
              .tab-content {
                  border: 1px solid #ccc;
                  border-radius: 0 5px 5px 5px;
                  padding: 20px;
                  display: none;
              }
              .tab-content.active {
                  display: block;
              }
          </style>
      </head>
      <body>
          <div id="tabs">
              <div class="tab active" id="testCaseTab">Test Case Generator</div>
              <div class="tab" id="loginTab">UTG Agent</div>
          </div>
          <div id="testCaseContent" class="tab-content active">
          <h3>Generate Test Cases</h3>

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

          <!-- Submit button to generate test cases -->
          <button id="generateBtn">Generate Test Cases</button>

          <!-- Message area for feedback -->
          <div id="message" class="message"></div>
           </div>
          <!-- Tab content for Login -->
          <div id="loginContent" class="tab-content">
              <h3>Login</h3>
              <div class="form-group">
                  <label for="hostDir">Host Dir:</label>
                  <input type="text" id="hostDir" placeholder="Enter Host Dir">
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
              <label for="pytestDir">Pytest Dir:</label>
              <input type="text" id="pytestDir" placeholder="Enter Pytest Dir">
          </div>

          <div class="form-group">
              <label for="pythonPath">Python Path:</label>
              <input type="text" id="pythonPath" placeholder="Enter Python Path">
          </div>

          <div class="form-group">
              <label for="mvnPath">Maven Path:</label>
              <input type="text" id="mvnPath" placeholder="Enter Maven Path">
          </div>

          <div class="button-group">
              <button id="testConnectionBtn">Test Connection</button>
              <button id="testMavenBtn">Test Maven Command</button>
              <button id="testPytestBtn">Test Pytest Command</button>
          </div>

          <div class="button-group">
              <button id="clearAllBtn">Clear All</button>
              <button id="cancelBtn">Cancel</button>
              <button id="okBtn">Ok</button>
          </div>
              <div id="responseMessage" class="message"></div>
          </div>
          <script>
              const vscode = acquireVsCodeApi();
              // Tab switching functionality
              document.getElementById('testCaseTab').addEventListener('click', function() {
                  switchTab('testCaseTab', 'testCaseContent');
              });
              document.getElementById('loginTab').addEventListener('click', function() {
                  switchTab('loginTab', 'loginContent');
              });

              function switchTab(tabId, contentId) {
                  // Remove 'active' class from all tabs
                  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                  // Add 'active' class to the clicked tab
                  document.getElementById(tabId).classList.add('active');

                  // Hide all tab content
                  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                  // Show the selected tab content
                  document.getElementById(contentId).classList.add('active');
              }

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

            // Function to clear all input fields
              function clearFields() {
                  document.getElementById('hostDir').value = '';
                  document.getElementById('email').value = '';
                  document.getElementById('password').value = '';
                  document.getElementById('pytestDir').value = '';
                  document.getElementById('pythonPath').value = '';
                  document.getElementById('mvnPath').value = '';
              }

              // Test Connection button functionality
              document.getElementById('testConnectionBtn').addEventListener('click', () => {
                  const hostDir = document.getElementById('hostDir').value;
                  const email = document.getElementById('email').value;
                  const password = document.getElementById('password').value;

                  const payload = {
                      command: 'testConnection',
                      hostDir,
                      email,
                      password
                  };

                  vscode.postMessage(payload);
              });

              // Test Maven Command button functionality
              document.getElementById('testMavenBtn').addEventListener('click', () => {
                  const mvnPath = document.getElementById('mvnPath').value;

                  const payload = {
                      command: 'testMaven',
                      mvnPath
                  };

                  vscode.postMessage(payload);
              });

              // Test Pytest Command button functionality
              document.getElementById('testPytestBtn').addEventListener('click', () => {
                  const pytestDir = document.getElementById('pytestDir').value;
                  const pythonPath = document.getElementById('pythonPath').value;

                  const payload = {
                      command: 'testPytest',
                      pytestDir,
                      pythonPath
                  };

                  vscode.postMessage(payload);
              });

              // Clear All button functionality
              document.getElementById('clearAllBtn').addEventListener('click', () => {
                  clearFields();
              });

              // Placeholder for Cancel button
              document.getElementById('cancelBtn').addEventListener('click', () => {
                  // Implement functionality for "Cancel" button here
                  console.log('Cancel clicked');
              });

              // Placeholder for Ok button
              document.getElementById('okBtn').addEventListener('click', () => {
                  // Implement functionality for "Ok" button here
                  console.log('Ok clicked');
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

  private static async generateTestCases(
    model: string,
    file: File | null,
    performRefactoring: boolean,
    maxRefactoring: number | null
  ) {
    const apiUrl = 'https://your-api-endpoint';

    // Prepare the payload for the API request
    const formData = new FormData();
    formData.append('model', model);

    // Add file if provided
    if (file) {
      formData.append('file', file);
    }

    // Add refactoring options if selected
    if (performRefactoring) {
      formData.append('performRefactoring', 'true');
      formData.append('maxRefactoring', maxRefactoring?.toString() || '1');
    } else {
      formData.append('performRefactoring', 'false');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData, // Send the data as multipart/form-data
    });

    if (!response.ok) {
      throw new Error('Failed to generate test cases');
    }
    const data = (await response.json()) as { testCases: string[] };
    return data.testCases;
  }

  private static async addTestCasesToProject(testCases: string[]) {
    const filePath = vscode.workspace.rootPath + '/testCases.js'; // Adjust the file path as needed

    // Prepare the content to be written
    const content = testCases.join('\n');

    try {
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(filePath),
        Buffer.from(content)
      );
      vscode.window.showInformationMessage('Test cases have been added to testCases.js');
    } catch (error) {
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      vscode.window.showErrorMessage(`Error writing to file: ${errorMessage}`);
    }
  }
}
