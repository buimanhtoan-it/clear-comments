# Clear Comments

Clear Comments is a Visual Studio Code extension that quickly removes comments from your code files. Whether you're cleaning up code for production, analyzing it without distractions, or tidying up legacy files, Clear Comments supports a variety of languages including C#, JavaScript, TypeScript, VB, ASPX, and more.

## Features

- **Multi-Language Support:**  
  Remove single-line and multi-line comments from files written in languages such as:
  - **JavaScript/TypeScript/C#:** Supports `//` and `/* ... */` comments.
  - **VB:** Supports `'` style single-line comments.
  - **HTML/ASPX:** Supports `<!-- ... -->` comments.
  
- **Multiple Contexts:**  
  - **Editor Context:** Right-click inside an open file to clear comments.
  - **Explorer Context:** Right-click a file or select multiple files in the Explorer to clear comments in one go.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- Visual Studio Code

### Build & Install

1. **Clone the Repository or Download the Source:**

   ```bash
   git clone https://github.com/yourusername/clear-comments.git
   cd clear-comments
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Compile the Extension:**

   ```bash
   npm run compile
   ```

4. **Run the Extension in VS Code:**

   - Press `F5` in Visual Studio Code to launch a new Extension Development Host with the extension loaded.

5. **Package the Extension (Optional):**

   - Install the Visual Studio Code Extension Manager if you haven't already:

     ```bash
     npm install -g vsce
     ```

   - Package the extension:

     ```bash
     vsce package
     ```

   - This creates a `.vsix` file (e.g., `clear-comments-0.0.1.vsix`) which you can install via **Install from VSIX...** in VS Code.

## Usage

### From the Editor

1. Open a file (e.g., a JavaScript, TypeScript, C#, VB, or ASPX file) in VS Code.
2. Right-click anywhere within the editor and select **Clear Comments**.
3. Alternatively, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS), type **Clear Comments**, and hit Enter.
4. The extension will process the active document and remove comments based on the file’s language.

### From the Explorer

1. Open the Explorer view in VS Code.
2. Right-click on a file or select multiple files and right-click.
3. Choose **Clear Comments** from the context menu.
4. The extension will process each selected file and remove comments accordingly.

*Note:* The extension uses regex-based logic to identify and remove comments. For more advanced use cases or languages with complex comment structures, further improvements or language-specific parsers might be required.

## Supported Languages

- JavaScript
- TypeScript
- C#
- VB
- HTML / ASPX

If your file's language is not supported, the extension will notify you.

## Contributing

Contributions and feedback are welcome! If you encounter any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
