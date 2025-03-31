export const DATA_INFO_SCHEMA = {
  type: 'https://schema.org/DataInfo',
  fileUrl: 'https://schema.org/fileUrl',
  fileName: 'https://schema.org/fileName',
  webId: 'https://schema.org/webId',
  name: 'https://schema.org/name',
  uploadedAt: 'https://schema.org/uploadedAt',
  reason: 'https://schema.org/reason',
  location: 'https://schema.org/location', // The origin of the data
  status: 'https://schema.org/status', // Wether the data is still at the origin or just in the pod
};

export const DATA_DELETION_REQUEST_SCHEMA = {
  type: 'https://schema.org/DataDeletionRequest',
  id: 'https://schema.org/id',
  senderName: 'https://schema.org/senderName',
  senderWebId: 'https://schema.org/senderWebId',
  sentAt: 'https://schema.org/sentAt',
  confirmerName: 'https://schema.org/confirmerName',
  confirmerWebId: 'https://schema.org/confirmerWebId',
  confirmedAt: 'https://schema.org/confirmedAt',
  status: 'https://schema.org/status',
  data: 'https://schema.org/data',
};
