import { IExtensionConfigurator } from "../../configuration/contracts/IExtensionConfigurator";


export interface IExtensionScreeViewer {
  render: (content: string) => void;
}