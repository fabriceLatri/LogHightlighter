import { VSCodeEditor } from "../../vscodeUtils/VSCodeEditor";


export class Toaster {
  static showErrorMessage(message: string) {
    VSCodeEditor.showErrorMessage(message);
  }
}