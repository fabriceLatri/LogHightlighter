# Log Highlighter

**Log Highlighter** is an extension for Visual Studio Code that allows you to highlight lines in `.log` files based on keywords and time ranges. You can easily search for specific terms and filter logs by time to better analyze your log files.

## Features

- **Highlight logs**: Highlights keywords in `.log` files.
- **Time filter**: Filters logs based on a specific time range using the `-S` (since) and `-U` (until) options.
- **Opacity**: Lines outside the specified time range are dimmed.
- **Commands**:
  - `logHighlighter.search`: Search and highlight keywords in the logs.
  - `logHighlighter.clearHighlights`: Clear all highlights and opacity effects.

## Installation

### Method 1: From Visual Studio Code Marketplace

1. Open Visual Studio Code.
2. Go to the Extensions tab (Ctrl+Shift+X).
3. Search for **Log Highlighter**.
4. Click **Install**.

### Method 2: From the Terminal

You can also install the extension via the command line using the appropriate command.

## Usage

1. **Highlight logs**:
   - Open a `.log` file in VSCode.
   - Run the **Log Highlighter: Search** command (Ctrl+Shift+P and type `logHighlighter.search`).
   - Enter your keywords and, if needed, the time filters:
     - `-S HH:MM:SS`: Specify the start time (since).
     - `-U HH:MM:SS`: Specify the end time (until).
   - The extension will highlight the keywords in the logs and apply transparency to lines outside the specified time range.

2. **Clear highlights**:
   - Run the **Log Highlighter: Clear Highlights** command to remove the highlights and opacity effects.

## Configuration

You can configure the following settings in your `settings.json` file to customize the behavior of the extension:

### Configuration Parameters

- **`logHighlighter.inactiveOpacity`**: Set the opacity for log lines outside the time range (value between 0 and 1).
- **`logHighlighter.highlightColor`**: Set the highlight color (CSS color name or hexadecimal code).
- **`logHighlighter.disableHighlight`**: Disable keyword highlighting.

### Example `settings.json`:

An example configuration in `settings.json` is provided to help you customize the extension settings.

```json
{
  "logHighlighter.inactiveOpacity": 0.3,
  "logHighlighter.highlightColor": "blue",
  "logHighlighter.disableHighlight": true
}
```

## Contributions

Contributions are welcome! If you'd like to contribute to this extension, please open a **pull request** or submit an **issue** to report a problem.

## License

This extension is under the **MIT License**. Please refer to the `LICENSE` file for more details.
