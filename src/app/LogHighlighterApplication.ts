import { VSCodeCommand } from "../vscodeUtils/VSCodeCommand"
import { LogHighlighterRestoreCommand } from "./LogHighlighterRestoreCommand";
import { LogHighlighterSearchCommand } from "./LogHighlighterSearchCommand"




export class logHighlighterApplication {
  static bootstrap = () => {
    const searchCommand = VSCodeCommand.registerCommand('logHighlighter.search', LogHighlighterSearchCommand.run);
    const clearCommand = VSCodeCommand.registerCommand('logHighlighter.restore', LogHighlighterRestoreCommand.run)

    return { searchCommand, clearCommand }
  }
}