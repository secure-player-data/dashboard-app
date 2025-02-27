export class SessionNotSetException extends Error {
  constructor(message: string) {
    super(message);
  }
}
