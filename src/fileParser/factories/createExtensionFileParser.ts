import { HiddenLineFileParser } from "../impl/HidddenLineFileParser";

export function createExtensionFileParser() {
  return HiddenLineFileParser.getInstance();
} 