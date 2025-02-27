export class TeamNotFoundException extends Error {
  constructor(message: string) {
    super(message);
  }
}
