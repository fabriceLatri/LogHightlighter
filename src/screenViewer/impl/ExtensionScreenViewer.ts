import { VSCodeEditor } from "../../vscodeUtils/VSCodeEditor";
import { IExtensionConfigurator } from "../../configuration/contracts/IExtensionConfigurator";
import { EditorNotFound } from "../../errors/EditorNotFound";
import { IExtensionScreeViewer } from "../contracts/IExtensionSceenViewer";
import { Toaster } from "./VSCToaster";



export class ExtensionScreenViewer implements IExtensionScreeViewer {
  
  render = (content: string) => {
    try {
      const { getText, uri } = VSCodeEditor.getDocument();

      const newEdition = VSCodeEditor.createWorkspaceEdit();
      const fullRange = VSCodeEditor.createRange(0, getText?.().length ?? 0);

      newEdition.replace(uri, fullRange, content);
      VSCodeEditor.workspaceApplyEdit(newEdition);
    } catch (error) {
      if (error instanceof Error) {
        Toaster.showErrorMessage(error.message);
      }
    }
  }
}