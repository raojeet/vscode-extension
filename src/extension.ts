// src/extension.ts
import * as vscode from 'vscode';
import { TestCasePanelProvider } from './TestCasePanelProvider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new TestCasePanelProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TestCasePanelProvider.viewType,
      provider
    )
  );

  // Register the command to open the Test Case Generator
  context.subscriptions.push(
    vscode.commands.registerCommand('smartq.openTestCaseGenerator', () => {
      // The webview will be shown automatically in the Activity Bar
      vscode.commands.executeCommand('workbench.view.extension.testCaseGenerator');
    })
  );

  console.log('smartQa Copilot extension is now active!');
}

export function deactivate() {}
