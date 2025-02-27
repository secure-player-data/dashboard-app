export class InboxDoesNotExistException extends Error {
  constructor(message: string) {
    super(message);
  }
}
