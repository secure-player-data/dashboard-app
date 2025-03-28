export type DataInfo = {
  url: string;
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
};
