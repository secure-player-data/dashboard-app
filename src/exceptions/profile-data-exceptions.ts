export class ProfileDoesNotExistException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class CredentialsNotSetException extends Error {
  constructor(message: string) {
    super(message);
  }
}
