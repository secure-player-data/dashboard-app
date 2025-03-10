export class NoControlAccessError extends Error {
  public url: string | null;
  public webId: string | null;

  constructor(message: string, url?: string, webId?: string) {
    super(message);
    this.url = url ?? '';
    this.webId = webId ?? '';
  }
}

export class NoControlAccessErrors extends Error {
  public failedAccesses: { url: string; ownerWebId: string }[];

  constructor(
    message: string,
    failedAccesses: { url: string; ownerWebId: string }[]
  ) {
    super(message);
    this.failedAccesses = failedAccesses ?? [];
  }
}
