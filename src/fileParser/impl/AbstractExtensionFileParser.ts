import { IExtensionFileParser } from "../contracts/IExtensionFileParser";
import { VSCodeEditor } from '../../vscodeUtils/VSCodeEditor';

export abstract class AbstractExtensionFileParser implements IExtensionFileParser {
  protected filename: string | undefined;
  private originalContent: string | undefined;
  

  constructor() {
    const { getText, fileName } = VSCodeEditor.getDocument();
    this.filename = fileName;
    this.originalContent = getText?.();
  }

  abstract parseFile: (searchTerm: string | RegExp) => void;

  protected isSearchByRegExp = (search: RegExp | string): search is RegExp => search instanceof RegExp;

  public getOriginalContent = (): string | undefined => this.originalContent;

  protected isLogFile = (): boolean => VSCodeEditor.getDocument().fileName.endsWith('.log');

  protected getFilename = (): string | undefined => this.filename;

  protected setFilename = (filename: string | undefined) => this.filename = filename;

  protected saveOriginalContent = () => {
    const { fileName, getText } = VSCodeEditor.getDocument();
    
    if (fileName !== this.filename || !this.originalContent) {
      this.originalContent = getText();
    }
  }

  protected filterFileContent = (line: string, searchTerm: string | RegExp) => this.isSearchByRegExp(searchTerm) ? searchTerm.test(line) : line.includes(searchTerm);
}