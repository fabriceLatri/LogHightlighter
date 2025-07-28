import { createExtensionConfigurator } from "../configuration/factories/configuratorFactory";
import { createExtensionFileParser } from "../fileParser/factories/createExtensionFileParser";
import { ExtensionScreenViewer } from "../screenViewer/impl/ExtensionScreenViewer";
import { Toaster } from "../screenViewer/impl/VSCToaster"
import { VSCodeEditor } from '../vscodeUtils/VSCodeEditor';





export class LogHighlighterSearchCommand {
  static run = async () => {
    try {
      // const extensionConfigurator = createExtensionConfigurator();
      // const isHidenUnmatchedLines = extensionConfigurator.getConfig<boolean>('removeUnmatchedLines');

      const searchInput = await VSCodeEditor.showInputBox({
        placeHolder: 'Enter keywords and/or time filters (e.g., "error -S 10:00:00 -U 12:00:00")',
        prompt: 'Highlight logs based on keywords and/or time range',
        ignoreFocusOut: true
      })

      if (!searchInput) return;

      const fileParser = createExtensionFileParser();
      fileParser.parseFile(searchInput);
      const content = fileParser.getFileContentFiltered();
      if (content)
      new ExtensionScreenViewer().render(content);
    } catch (error) {
      if (error instanceof Error) {
        Toaster.showErrorMessage(error.message);
      }
    }
  }
}