export type DataInfo = {
  id: string;
  fileUrl: string;
  uploader: {
    webId: string;
    name: string;
  };
  uploadedAt: Date;
  reason: string;
  location: string;
};
