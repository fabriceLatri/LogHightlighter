import { FileExtensionError } from "../../errors/FileExtensionError";
import { Toaster } from "../../screenViewer/impl/VSCToaster";
import { AbstractExtensionFileParser } from "./AbstractExtensionFileParser";





export class HiddenLineFileParser extends AbstractExtensionFileParser {
  private fileContentFiltered: string | undefined;

  private static instance: HiddenLineFileParser | undefined;

  private constructor() {
    super()
  }

  static getInstance = () => {
    if (!this.instance) {
      this.instance = new HiddenLineFileParser();
    }

    return this.instance;
  }

  parseFile = (searchTerm: string | RegExp) => {
      if (!this.isLogFile()) {
        throw new FileExtensionError('This command works only on .log files.');
      }

      this.saveOriginalContent();

      const lines = (this.fileContentFiltered ?? this.getOriginalContent())?.split('\n');
      this.fileContentFiltered = (lines?? []).filter((line) => this.filterFileContent(line, searchTerm)).join('\n');
  }

  getFileContentFiltered = () => this.fileContentFiltered;
}