import * as vscode from "vscode";

export class TestCasePanel {
  public static currentPanel: TestCasePanel | undefined;

  public static createOrShow(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
      "testCaseGenerator",
      "Test Case Generator",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );

    panel.webview.html = this.getWebviewContent();
    panel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === "generateTestCases") {
        try {
          const testCases = await this.generateTestCases(
            message.model,
            message.fileName
              ? new File([message.fileName], message.fileName)
              : null,
            message.performRefactoring,
            message.maxRefactoring
          );

          // Once test cases are generated, you can handle the result as needed
          panel.webview.postMessage({
            command: "showMessage",
            text: "Test cases generated successfully!",
          });
        } catch (error) {
          const errorMessage = (error as Error).message || 'An unknown error occurred';
          panel.webview.postMessage({
            command: "showMessage",
            text:  `Failed to generate test cases: ${errorMessage}`,
          });
        }
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

  private static async generateTestCases(
    model: string,
    file: File | null,
    performRefactoring: boolean,
    maxRefactoring: number | null
  ) {
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
    } else {
      formData.append("performRefactoring", "false");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData, // Send the data as multipart/form-data
    });

    if (!response.ok) {
      throw new Error("Failed to generate test cases");
    }
    const data = await response.json() as { testCases: string[] };
    return data.testCases;
  }

  private static async addTestCasesToProject(testCases: string[]) {
    const filePath = vscode.workspace.rootPath + "/testCases.js"; // Adjust the file path as needed

    // Prepare the content to be written
    const content = testCases.join("\n");

    try {
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(filePath),
      Buffer.from(content)
    );
    vscode.window.showInformationMessage(
      "Test cases have been added to testCases.js"
    );
    } catch (error) {
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      vscode.window.showErrorMessage(`Error writing to file: ${errorMessage}`);
    }
  }
}
