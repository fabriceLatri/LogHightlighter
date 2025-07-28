import { createExtensionFileParser } from "../fileParser/factories/createExtensionFileParser";
import { ExtensionScreenViewer } from "../screenViewer/impl/ExtensionScreenViewer";
import { Toaster } from "../screenViewer/impl/VSCToaster"



export class LogHighlighterRestoreCommand {
  static run = () => {
    try {
      const originalContent = createExtensionFileParser().getOriginalContent();
      
      if (originalContent) 
        new ExtensionScreenViewer().render(originalContent)
    } catch (error) {
      if (error instanceof Error) Toaster.showErrorMessage(error.message);
    }
  }
}