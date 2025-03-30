# Clear Comments

Clear Comments is a Visual Studio Code extension designed to help you quickly remove comments from your code. It works by processing the currently open document—or one or more files selected in the Explorer—using a simple mapping of language IDs to comment tokens. The extension removes entire lines that are solely comments and, when appropriate, removes inline comment portions (only if the code before the comment marker is empty or ends with a semicolon (`;`) or a closing brace (`}`)).

If you try to run Clear Comments on a file whose language isn’t supported, the extension will inform you via an information message.

## Features

- **Supported Languages:**
  - **JavaScript / TypeScript / TSX:** Removes both line (`//`) and block (`/* … */`) comments.
  - **C / C++:** Removes both line (`//`) and block (`/* … */`) comments.
  - **C#:** Removes line and block comments.
  - **VB:** Removes lines starting with the VB comment token (`'`).
  - **HTML / ASPX:** Removes block comments (`<!-- … -->`).
  - **Other Supported Languages:**
    - CoffeeScript, F#, Go, Handlebars, Jade, Java, Less, Lua, Makefile, PHP, Rust, SCSS, ShaderLab, Shell/Bash, Swift, XML, XSL, YAML.

- **Inline Comment Removal:**
  - If an inline comment marker (`//`) appears in a line, the comment part is removed only if the code preceding the marker is empty or ends with `;` or `}`.
  - The same heuristic is applied to inline block comments.
  
- **User Feedback:**
  - Information messages are shown when the active document is processed or when a file’s language is not supported.
  - All actions are logged to the Developer Tools console for debugging.

- **Non-destructive Editing:**
  - The extension applies changes to your document in memory without auto-saving. This lets you review the changes before you decide to save the file manually.

## Installation

1. **Install from VSIX (if not in Marketplace):**
   - Package the extension using `vsce package` (if you have the source) or download the `.vsix` file.
   - In VS Code, open the Extensions view.
   - Click the ellipsis (`...`) in the upper-right corner and select **Install from VSIX...**.
   - Locate the `.vsix` file and install it.

2. **From the Visual Studio Code Marketplace:**
   - Search for "Clear Comments" and install the extension directly from the marketplace (if published).

## Easy Usage

### Using the Explorer Context Menu

1. In the Explorer view, right-click on one or more files.
2. Select **Clear Comments** from the context menu.
3. The extension processes the selected file(s). Changes are applied in memory—you need to save the file manually if you wish to keep the modifications.

### Using the Command Palette

1. Open the file you want to process.
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the Command Palette.
3. Type **Clear Comments** and select the command.
4. The extension processes the active document and displays an information message when done.

## Supported File Types

- **C / C++:** `.c`, `.cpp`, `.h`
- **C#:** `.cs`
- **CoffeeScript:** `.coffee`
- **F#:** `.fs`
- **Go:** `.go`
- **Handlebars:** `.hbs`
- **HTML / ASPX:** `.html`, `.aspx`
- **Jade / Pug:** `.jade`, `.pug`
- **Java:** `.java`
- **JavaScript:** `.js`
- **Less:** `.less`
- **Lua:** `.lua`
- **Makefile:** `Makefile`
- **PHP:** `.php`
- **Rust:** `.rs`
- **SCSS:** `.scss`
- **ShaderLab:** `.shader`
- **Shell / Bash:** `.sh`
- **Swift:** `.swift`
- **TypeScript / TSX:** `.ts`, `.tsx`
- **VB:** `.vb`
- **XML / XSL:** `.xml`, `.xsl`
- **YAML:** `.yml`, `.yaml`

If the language of the file is not supported by the extension, an information message will inform you, and no changes will be made.

## Logging and Debugging

During processing, the extension logs key events and actions to the Developer Tools console. You can view these logs by opening **Help > Toggle Developer Tools** in the Extension Development Host. This is useful for understanding how your code is being processed and for troubleshooting any issues.

## Contribution

Contributions, bug reports, and feature requests are welcome!  
If you have suggestions or improvements, please open an issue or submit a pull request at our [GitHub repository](https://github.com/buimanhtoan-it/clear-comments.git).

## License

This extension is licensed under the ISC License.
