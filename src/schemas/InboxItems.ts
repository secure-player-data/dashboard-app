export const INBOX_ITEM_SCHEMA = {
  type: 'https://schema.org/type',
  inboxItem: 'https://schema.org/inboxItem',
  name: 'https://schema.org/name',
  email: 'https://schema.org/email',
  webId: 'https://schema.org/webId',
  podUrl: 'https://schema.org/podUrl',
  time: 'http://www.w3.org/ns/posix/stat#mtime',
  organization: 'https://schema.org/Organization',
};

export const INVITATION_SCHEMA = {
  ...INBOX_ITEM_SCHEMA,
};

export const INFORMATION_SCHEMA = {
  ...INBOX_ITEM_SCHEMA,
  informationHeader: 'https://schema.org/informationHeader',
  informationBody: 'https://schema.org/informationBody',
};

export const ACCESS_REQUEST_SCHEMA = {
  ...INBOX_ITEM_SCHEMA,
  accessReason: 'https://schema.org/requestReason',
};

export const DELETE_DATA_NOTIFICATION_SCHEMA = {
  ...INBOX_ITEM_SCHEMA,
  deletionRequestUrl: 'https://schema.org/deletionRequestUrl',
  data: 'https://schema.org/data',
};
