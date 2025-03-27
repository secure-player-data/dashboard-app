export type DataInfoStatus = '' | 'Requested' | 'Confirmed';

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

export type DataDeletionRequest = {
  id: string;
  sender: {
    name: string;
    webId: string;
  };
  sentAt: Date;
  confirmer?: {
    name: string;
    webId: string;
  };
  confirmedAt?: Date;
  status: DataInfoStatus;
};
