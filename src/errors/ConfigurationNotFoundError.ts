


export class ConfigurationNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Configuration not found for this identifier ${identifier}`);
  }
}