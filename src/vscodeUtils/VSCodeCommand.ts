import { commands } from 'vscode';



export class VSCodeCommand {
  static registerCommand = (command: string, callback: (...args: any[]) => any) => commands.registerCommand(command, callback);
}