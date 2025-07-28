import { ConfigurationNotFoundError } from "../../errors/ConfigurationNotFoundError";
import { VSCodeEditor } from "../../vscodeUtils/VSCodeEditor";
import { ExtensionOptions, IExtensionConfigurator } from "../contracts/IExtensionConfigurator";


const APP_SECTION_CONFIGURATION = 'loghighlighter';

export class ExtensionConfigurator implements IExtensionConfigurator {

  private readonly config = VSCodeEditor.getConfiguration(APP_SECTION_CONFIGURATION);

  private static instance: ExtensionConfigurator | undefined;

  private constructor() {};

  static getInstance() {
    if (!this.instance) {
      this.instance = new ExtensionConfigurator();
    }

    return this.instance;
  }

  getConfig = <T>(option: ExtensionOptions): T => {
    const value = this.config.get<T>(option);

    if (!value) throw new ConfigurationNotFoundError(option);

    return value;
  }
}