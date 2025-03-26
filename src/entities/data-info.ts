export type DataInfoStatus = '' | 'Deletion Requested' | 'Deletion Confirmed';

export type DataInfo = {
  id: string;
  file: {
    url: string;
    name: string;
  };
  uploader: {
    webId: string;
    name: string;
  };
  uploadedAt: Date;
  reason: string;
  location: string;
  status: DataInfoStatus;
};
