import * as vscode from 'vscode';

/**
 * Uses a simple mapping of language IDs to comment tokens to remove entire lines
 * that are solely comments and to remove inline comment portions after code,
 * but only if the code before the inline comment token ends with ';' or '}' (or is empty).
 */
function removeCommentsUsingConfig(doc: vscode.TextDocument): string {
  // Mapping of language IDs to their comment configuration.
  const commentConfig: Record<string, { line?: string; block?: [string, string] }> = {
    javascript: { line: '//', block: ['/*', '*/'] },
    typescript: { line: '//', block: ['/*', '*/'] },
    "typescriptreact": { line: '//', block: ['/*', '*/'] }, // Support for TSX files.
    csharp: { line: '//', block: ['/*', '*/'] },
    vb: { line: "'" },
    html: { block: ['<!--', '-->'] },
    aspx: { block: ['<!--', '-->'] }
  };

  const config = commentConfig[doc.languageId];
  if (!config) {
    const message = `Clear Comments: Language "${doc.languageId}" is not supported.`;
    vscode.window.showInformationMessage(message);
    console.log(message);
    return doc.getText();
  }

  const lines = doc.getText().split(/\r?\n/);
  let resultLines: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();
    let isEntirelyComment = false;

    // Check if the entire line is a line comment.
    if (config.line && trimmed.startsWith(config.line)) {
      isEntirelyComment = true;
    }
    // Check if the entire line is a block comment.
    if (config.block && trimmed.startsWith(config.block[0]) && trimmed.endsWith(config.block[1])) {
      isEntirelyComment = true;
    }

    if (isEntirelyComment) {
      console.log(`Removed comment-only line: "${line}"`);
      continue; // Skip this line.
    }

    // Process inline line comments.
    if (config.line && line.includes(config.line)) {
      const index = line.indexOf(config.line);
      const codePart = line.substring(0, index).trimEnd();
      // Only remove the inline comment if the code part is empty (no code)
      // or if it ends with ';' or '}'.
      if (codePart === '' || codePart.endsWith(';') || codePart.endsWith('}')) {
        console.log(`Removed inline comment from line: "${line}"`);
        line = codePart;
      }
    }

    // Process inline block comments (heuristic: remove one occurrence per line).
    if (config.block && line.includes(config.block[0]) && line.includes(config.block[1])) {
      const start = line.indexOf(config.block[0]);
      const end = line.indexOf(config.block[1], start);
      if (start !== -1 && end !== -1 && start < end) {
        const before = line.substring(0, start).trimEnd();
        const after = line.substring(end + config.block[1].length).trimStart();
        // If the code before the block comment ends with ';' or '}' (or is empty), remove the block.
        if (before === '' || before.endsWith(';') || before.endsWith('}')) {
          console.log(`Removed inline block comment from line: "${line}"`);
          line = before + (after ? ' ' + after : '');
        }
      }
    }

    resultLines.push(line);
  }
  
  return resultLines.join('\n');
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Clear Comments extension is activating...');

  let disposable = vscode.commands.registerCommand('clear-comment.clearComments', async (uri: vscode.Uri | vscode.Uri[] | undefined) => {
    console.log('Clear Comments command triggered.');
    if (uri) {
      // Process one or multiple selected files from Explorer.
      console.log('Processing file(s) from Explorer.');
      const uris: vscode.Uri[] = Array.isArray(uri) ? uri : [uri];
      for (const fileUri of uris) {
        console.log(`Processing file: ${fileUri.fsPath}`);
        await processFile(fileUri);
      }
      vscode.window.showInformationMessage('Comments cleared for selected file(s).');
    } else {
      // Process the active text editor document.
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return;
      }
      console.log(`Processing active document: ${editor.document.fileName}`);
      await processDocument(editor.document, editor);
      vscode.window.showInformationMessage('Comments cleared in the active document.');
    }
  });

  context.subscriptions.push(disposable);
}

async function processFile(fileUri: vscode.Uri): Promise<void> {
  try {
    const doc = await vscode.workspace.openTextDocument(fileUri);
    console.log(`Document language: ${doc.languageId}`);
    const newText = removeCommentsUsingConfig(doc);
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
    edit.replace(fileUri, fullRange, newText);
    await vscode.workspace.applyEdit(edit);
    // Do not automatically save the file.
    console.log(`File processed (not auto-saved): ${fileUri.fsPath}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to process ${fileUri.fsPath}: ${error}`);
    console.error(`Error processing file ${fileUri.fsPath}:`, error);
  }
}

async function processDocument(doc: vscode.TextDocument, editor: vscode.TextEditor): Promise<void> {
  console.log(`Document language: ${doc.languageId}`);
  const newText = removeCommentsUsingConfig(doc);
  const fullRange = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
  await editor.edit(editBuilder => {
    editBuilder.replace(fullRange, newText);
  });
  console.log(`Active document processed (not auto-saved): ${doc.fileName}`);
}

export function deactivate() {
  console.log('Clear Comments extension is deactivating.');
}
