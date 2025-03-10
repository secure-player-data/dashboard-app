export type InboxItem = {
  type: 'Invitation' | 'Access Request' | 'Information';
  senderName: string;
  email: string;
  webId: string;
  podUrl: string;
  date?: string;
  organization?: string;
  accessReason?: string;
  informationHeader?: string;
  informationBody?: string;
};
