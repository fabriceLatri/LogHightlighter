

export type ExtensionOptions = 'removeUnmatchedLines' 


export interface IExtensionConfigurator {
  getConfig: <T>(option: ExtensionOptions) => T;
}