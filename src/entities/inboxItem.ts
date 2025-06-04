import { DataInfo } from './data-info';

export type InboxItem = {
  type: string;
  senderName: string;
  email: string;
  webId: string;
  podUrl: string;
  date: string;
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

export type DataDeletionNotification = InboxItem & {
  data: DataInfo[];
  deletionRequestUrl: string;
};

export type LeaveTeamNotification = InboxItem & {
  body: string;
};
