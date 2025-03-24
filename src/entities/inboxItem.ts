export type InboxItem = {
  type: string;
  senderName: string;
  email: string;
  webId: string;
  podUrl: string;
  date?: string;
  organization?: string;
};

export type Invitation = InboxItem & {};

export type AccessRequest = InboxItem & {
  accessReason: string;
};

export type Information = InboxItem & {
  informationHeader: string;
  informationBody: string;
};
