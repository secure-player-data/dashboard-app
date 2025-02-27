import { InboxItem } from '@/entities/inboxItem';

export const queryKeys = {
  profile: (sessionId: string) => ['profile', sessionId],
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
  inbox: (sessionId: string) => ['inbox', sessionId],
  accessHistory: (sessionId: string) => ['accessHistory', sessionId],
};
