import * as vscode from 'vscode';
import * as vsctm from 'vscode-textmate';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as oniguruma from 'vscode-oniguruma';

const readFileAsync = promisify(fs.readFile);

/**
 * Map of VS Code languageId -> corresponding grammar filename.
 * Adjust or add entries to match the languages/filenames you support.
 */
const SUPPORTED_LANGUAGES: Record<string, string> = {
  "c": "c.tmLanguage.json",
  "cpp": "c++.tmLanguage.json",
  "coffeescript": "coffeescript.tmLanguage.json",
  "csharp": "csharp.tmLanguage.json",
  "cshtml": "cshtml.tmLanguage.json",
  "fsharp": "fsharp.tmLanguage.json",
  "go": "go.tmLanguage.json",
  "handlebars": "Handlebars.tmLanguage.json",
  "html": "html.tmLanguage.json",
  "jade": "Jade.tmLanguage.json",
  "java": "java.tmLanguage.json",
  "javascript": "JavaScript.tmLanguage.json",
  "less": "less.tmLanguage.json",
  "lua": "lua.tmLanguage.json",
  // For Python grammar:
  "python": "MagicPython.tmLanguage.json",
  // For extended regex grammar:
  "regexp": "MagicRegExp.tmLanguage.json",
  "makefile": "Makefile.tmLanguage.json",
  "php": "php.tmLanguage.json",
  "rust": "rust.tmLanguage.json",
  "scss": "scss.tmLanguage.json",
  "shaderlab": "shaderlab.tmLanguage.json",
  "shellscript": "Shell-Unix-Bash.tmLanguage.json",
  "swift": "swift.tmLanguage.json",
  "typescript": "TypeScript.tmLanguage.json",
  "typescriptreact": "TypeScriptReact.tmLanguage.json",
  "xml": "xml.tmLanguage.json",
  "xsl": "xsl.tmLanguage.json",
  "yaml": "yaml.tmLanguage.json"
};

/**
 * Given a languageId (e.g., 'typescript'), return the path to the grammar file
 * (e.g., /absolute/path/to/out/grammars/TypeScript.tmLanguage.json) if available.
 * If not supported, returns null.
 */
function getGrammarPath(languageId: string): string | null {
  const grammarFilename = SUPPORTED_LANGUAGES[languageId];
  if (!grammarFilename) {
    // The language is not in our SUPPORTED_LANGUAGES map
    return null;
  }
  const grammarFile = path.join(__dirname, 'grammars', grammarFilename);
  return fs.existsSync(grammarFile) ? grammarFile : null;
}

async function loadGrammar(languageId: string): Promise<vsctm.IGrammar | null> {
  // 1) Find the grammar path for the given languageId
  const grammarPath = getGrammarPath(languageId);
  if (!grammarPath) {
    // Show info message only once per operation if no match.
    vscode.window.showInformationMessage(
      `Language "${languageId}" is not supported by Clear Comments extension.`
    );
    return null;
  }

  try {
    // 2) Load that grammar file
    const content = await readFileAsync(grammarPath, 'utf8');
    const rawGrammar = JSON.parse(content);

    // 3) Read the wasm binary for oniguruma (ensure onig.wasm is copied to your out folder)
    const wasmPath = path.join(__dirname, 'onig.wasm');
    const wasmBin = await readFileAsync(wasmPath);

    // 4) Create a promise that resolves once WASM is loaded
    const onigLib = oniguruma.loadWASM(wasmBin.buffer as ArrayBuffer).then(() => {
      return {
        createOnigScanner: (patterns: string[]) => new oniguruma.OnigScanner(patterns),
        createOnigString: (s: string) => new oniguruma.OnigString(s)
      };
    });

    // 5) Create a TextMate registry
    const registry = new vsctm.Registry({
      onigLib,
      loadGrammar: async (_scopeName: string) => null
    });

    // 6) Add the grammar to the registry
    const grammar = await registry.addGrammar(rawGrammar);
    return grammar;
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to load grammar for ${languageId}: ${err}`);
    return null;
  }
}

/**
 * Use a TextMate grammar to remove comments from the given document.
 * If we don't have a grammar for doc.languageId, returns the text unchanged.
 */
async function removeCommentsUsingTextMate(doc: vscode.TextDocument): Promise<string> {
  const grammar = await loadGrammar(doc.languageId);
  // If we didn't find a matching grammar, skip removing comments
  if (!grammar) {
    return doc.getText();
  }

  const lines = doc.getText().split(/\r?\n/);
  const processedLines: string[] = [];

  // Store the rule stack as 'any' because newer vscode-textmate no longer exports StackElement
  let ruleStack: any = null;

  for (const line of lines) {
    const originallyEmpty = (line.trim().length === 0);

    // Tokenize this line, preserving multi-line comment context
    const lineResult = grammar.tokenizeLine(line, ruleStack);
    const tokens = lineResult.tokens;
    ruleStack = lineResult.ruleStack; // carry forward for multi-line/block comments

    // Identify the non-comment segments in this line
    const nonCommentRanges: { startIndex: number; endIndex: number }[] = [];
    let lastIndex = 0;

    for (const token of tokens) {
      if (token.scopes.some(scope => scope.includes('comment'))) {
        // If there's a gap between lastIndex and the start of the comment, record it
        if (token.startIndex > lastIndex) {
          nonCommentRanges.push({ startIndex: lastIndex, endIndex: token.startIndex });
        }
        lastIndex = token.endIndex;
      }
    }
    // Add any trailing text after the last comment
    if (lastIndex < line.length) {
      nonCommentRanges.push({ startIndex: lastIndex, endIndex: line.length });
    }

    // Reconstruct the line from non-comment segments
    const processedLine = nonCommentRanges
      .map(range => line.substring(range.startIndex, range.endIndex))
      .join('');

    // Keep lines that still have code OR were originally empty (i.e., no removed comments)
    if (processedLine.trim().length > 0 || originallyEmpty) {
      processedLines.push(processedLine);
    }
  }

  return processedLines.join('\n');
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Clear Comments extension is activating with multi-language TextMate-based removal...');

  const disposable = vscode.commands.registerCommand('clear-comment.clearComments', async (uri: vscode.Uri | vscode.Uri[] | undefined) => {
    if (uri) {
      const uris: vscode.Uri[] = Array.isArray(uri) ? uri : [uri];
      for (const fileUri of uris) {
        await processFile(fileUri);
      }
      vscode.window.showInformationMessage('Comments cleared for selected file(s).');
    } else {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return;
      }
      await processDocument(editor.document, editor);
      vscode.window.showInformationMessage('Comments cleared in the active document.');
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Process a specific file on disk by removing comments and replacing the file contents.
 */
async function processFile(fileUri: vscode.Uri): Promise<void> {
  try {
    const doc = await vscode.workspace.openTextDocument(fileUri);
    const newText = await removeCommentsUsingTextMate(doc);

    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      doc.positionAt(0),
      doc.positionAt(doc.getText().length)
    );

    edit.replace(fileUri, fullRange, newText);
    await vscode.workspace.applyEdit(edit);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to process ${fileUri.fsPath}: ${error}`);
  }
}

/**
 * Process the currently opened document in the editor.
 */
async function processDocument(doc: vscode.TextDocument, editor: vscode.TextEditor): Promise<void> {
  const newText = await removeCommentsUsingTextMate(doc);
  const fullRange = new vscode.Range(
    doc.positionAt(0),
    doc.positionAt(doc.getText().length)
  );
  await editor.edit(editBuilder => {
    editBuilder.replace(fullRange, newText);
  });
}

export function deactivate() {
  console.log('Clear Comments extension is deactivating.');
}
