import { IExtensionConfigurator } from "../../configuration/contracts/IExtensionConfigurator";





export interface IExtensionFileParser {
  parseFile: (searchTerm: string | RegExp) => void;
}