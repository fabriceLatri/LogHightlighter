import { window as VSCWindow, WorkspaceEdit, Range, workspace, InputBoxOptions } from 'vscode';
import { EditorNotFound } from '../errors/EditorNotFound';
import { DocumentNotFound } from '../errors/DocumentNotFound';

export class VSCodeEditor {
  static showErrorMessage = (message: string) => VSCWindow.showErrorMessage(message);
  static showInformationMessage = (message: string) => VSCWindow.showInformationMessage(message);
  static getDocument = () => {
    const document = VSCWindow.activeTextEditor?.document;

    if (!document) {
      throw new DocumentNotFound();
    }

    return document;
  };
  static createWorkspaceEdit = () => new WorkspaceEdit();
  static createRange = (positionStart: number, positionEnd: number) => {
    const { positionAt } = VSCWindow.activeTextEditor?.document ?? {};

    if (!positionAt) {
      throw new EditorNotFound();
    }

    return new Range(positionAt(positionStart), positionAt(positionEnd));
  };
  static workspaceApplyEdit = (edition: WorkspaceEdit) => {
    workspace.applyEdit(edition)
  };
  static onDidChangeConfiguration = (listener: () => void) => workspace.onDidChangeConfiguration(listener);
  static createInputBox = () => VSCWindow.createInputBox();
  static showInputBox = async (options?: InputBoxOptions): Promise<string|RegExp> => {
    const input = await VSCWindow.showInputBox(options);

    if (!input) return '';

    const regexpLike = input.match(/^\/(.+)\/([a-z]*)?$/i);

    if (regexpLike) {
      const pattern = regexpLike[1];
      const flags = regexpLike[2] ?? '';
      try {
        return new RegExp(pattern, flags);
      } catch (e) {
        return input;
      }
    }

    return input;
  };
  static getConfiguration = (section: string) => {
    return workspace.getConfiguration(section);
  }
}


