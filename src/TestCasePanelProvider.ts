// src/TestCasePanelProvider.ts
import * as vscode from 'vscode';
import { TestCasePanel } from './panel';

export class TestCasePanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'testCasePanelView';

  constructor(private readonly context: vscode.ExtensionContext) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = TestCasePanel.getWebviewContent();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'login':
            try {
              const loginResponse = await TestCasePanel.login(
                message.email,
                message.password,
                message.hostUrl,
                message.pytestDir,
                message.pythonFile
              );

              // Save the access token in workspace state
              this.context.workspaceState.update('access_token', loginResponse.access_token);

              webviewView.webview.postMessage({
                command: 'loginSuccess',
                text: 'Login successful!',
              });
            } catch (error: unknown) {
              const errorMessage = (error as Error).message || 'Login failed';
              webviewView.webview.postMessage({
                command: 'loginError',
                text: errorMessage,
              });
            }
            break;

          case 'openTab':
            const accessToken = this.context.workspaceState.get<string>('access_token');
            if (!accessToken) {
              // If not logged in, prompt login
              webviewView.webview.postMessage({ command: 'promptLogin' });
            } else {
              // Switch to the requested tab
              webviewView.webview.postMessage({ command: 'switchTab', tabId: message.tabId });
            }
            break;

          case 'generateTestCases':
            try {
              const accessToken = this.context.workspaceState.get<string>('access_token');
              if (!accessToken) {
                throw new Error('Not authenticated');
              }

              const testCases = await TestCasePanel.generateTestCases(
                accessToken,
                message.model,
                message.fileName,
                message.performRefactoring,
                message.maxRefactoring
              );

              // Handle the generated test cases (e.g., save to a file)
              await TestCasePanel.addTestCasesToProject(testCases);

              webviewView.webview.postMessage({
                command: 'showMessage',
                text: 'Test cases generated successfully!',
              });
            } catch (error: unknown) {
              const errorMessage = (error as Error).message || 'Failed to generate test cases';
              webviewView.webview.postMessage({
                command: 'showMessage',
                text: `Failed to generate test cases: ${errorMessage}`,
              });
            }
            break;

          // Add more cases as needed (e.g., testConnection, testMaven, testPytest)

          default:
            vscode.window.showErrorMessage(`Unknown command: ${message.command}`);
        }
      },
      undefined,
      this.context.subscriptions
    );
  }
}
