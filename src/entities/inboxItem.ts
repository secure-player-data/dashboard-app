export type InboxItem = {
  type: 'Invitation' | 'Access Request';
  senderName: string;
  email: string;
  webId: string;
  podUrl: string;
  date?: string;
  organization?: string;
  accessReason?: string;
};
