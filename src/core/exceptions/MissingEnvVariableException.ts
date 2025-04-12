export class MissingEnvVariableException extends Error {
  constructor(key: string) {
    super(`Missing environment variable: ${key}`);
    this.name = 'MissingEnvVariableException';
  }
}
