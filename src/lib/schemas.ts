export const STAT = {
  size: 'http://www.w3.org/ns/posix/stat#size',
  time: 'http://www.w3.org/ns/posix/stat#mtime',
};

export const INBOX_ITEM_SCHEMA = {
  type: 'https://schema.org/inboxItemType',
  inboxItem: 'https://schema.org/inboxItem',
  name: 'https://schema.org/name',
  email: 'https://schema.org/email',
  webId: 'https://schema.org/webId',
  podUrl: 'https://schema.org/podUrl',
  time: 'http://www.w3.org/ns/posix/stat#mtime',
  xmlstring: 'http://www.w3.org/2001/XMLSchema#string',
  organization: 'https://schema.org/Organization',
  accessReason: 'https://schema.org/requestReason',
  informationHeader: 'https://schema.org/informationHeader',
  informationBody: 'https://schema.org/informationBody',
};

export const ACCESS_REQUEST_SCHEMA = {
  accessRequest: 'https://schema.org/accessRequest',
  name: 'https://schema.org/name',
  webId: 'https://schema.org/webId',
  podUrl: 'https://schema.org/podUrl',
  time: 'http://www.w3.org/ns/posix/stat#mtime',
};

export const LOG_SCHEMA = {
  log: 'https://schema.org/Log',
  time: 'https://schema.org/time',
  webId: 'https://schema.org/webId',
  resource: 'https://schema.org/resource',
  action: 'https://schema.org/action',
};
