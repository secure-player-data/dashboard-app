export class TeamNotFoundException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class TeamOwnerException extends Error {
  constructor(message: string) {
    super(message);
  }
}
