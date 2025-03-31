import { InboxItem } from '@/entities/inboxItem';
import { DataInfo } from '@/entities/data-info';

export const queryKeys = {
  data: (podUrl: string, subDir: string) => ['data', podUrl, subDir],
  file: (sessionId: string, url: string) => ['file', sessionId, url],
  members: {
    default: (sessionId: string) => ['members', sessionId],
    withPermissions: (sessionId: string) => [
      'membersWithPermissions',
      sessionId,
    ],
  },
  invitation: (
    sessionId: string,
    receiverPod: string,
    receiverWebId: string,
    invitation: InboxItem | undefined
  ) => ['invitation', sessionId, receiverPod, receiverWebId, invitation],
  accessRequest: (
    sessionId: string,
    receiverPod: string,
    receiverWebId: string,
    accessRequest: InboxItem | undefined
  ) => ['accessRequest', sessionId, receiverPod, receiverWebId, accessRequest],
  accessHistory: (pod: string) => ['accessHistory', pod],
  accessControl: {
    resourceList: (sessionId: string) => ['resourceList', sessionId],
    permissionDetails: (sessionId: string, url: string) => [
      'permissionDetails',
      sessionId,
      url,
    ],
  },
  uploadPlayerData: (sessionId: string) => ['uploadPlayerData', sessionId],
};
