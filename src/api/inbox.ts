import { Session } from '@inrupt/solid-client-authn-browser';
import {
  createThing,
  getSolidDataset,
  setThing,
  getThingAll,
  buildThing,
  createSolidDataset,
  createContainerAt,
  solidDatasetAsTurtle,
  deleteSolidDataset,
  getStringNoLocale,
  Thing,
} from '@inrupt/solid-client';
import { RDF } from '@inrupt/vocab-common-rdf';
import { BASE_APP_CONTAINER, INBOX_CONTAINER } from './paths';
import { safeCall } from '@/utils';
import { InboxDoesNotExistException } from '@/exceptions/inbox-exceptions';
import {
  InboxItem,
  Invitation,
  Information,
  AccessRequest,
} from '@/entities/inboxItem';
import {
  ACCESS_REQUEST_SCHEMA,
  INBOX_ITEM_SCHEMA,
  INVITATION_SCHEMA,
  INFORMATION_SCHEMA,
} from '@/schemas/InboxItems';
import { fetchProfileData, updateAppProfile } from './profile';
import { addMemberToTeam, fetchTeamUrl } from './team';
import { setPublicAccess, updateAgentAccess } from './access-control';
import { sendAcceptMail, sendInvitationMail } from './email';

/**
 * Fetches the inbox of a user
 * @param session of the user requesting the inbox
 * @param pod url of the pod for the user to fetch the inbox from
 * @returns
 */
export async function fetchInbox(
  session: Session | null,
  pod: string | null
): Promise<InboxItem[]> {
  if (!session || !pod) {
    throw new Error('No session found');
  }

  // Get inbox url
  const inboxUrl = `${pod}${BASE_APP_CONTAINER}/${INBOX_CONTAINER}/`;

  const [datasetError, dataset] = await safeCall(
    getSolidDataset(inboxUrl, {
      fetch: session.fetch,
    })
  );
  if (datasetError) {
    throw new InboxDoesNotExistException('Inbox dataset was not found');
  }

  const inboxThings = getThingAll(dataset);

  if (!inboxThings) {
    throw new InboxDoesNotExistException('Inbox thing was not found');
  }

  let inbox = await Promise.all(
    inboxThings
      .filter((item) => item.url.split('inbox/')[1]?.length > 0)
      .map(
        async (item) =>
          await getSolidDataset(item.url, { fetch: session.fetch })
      )
  );

  const inboxItems: InboxItem[] = inbox
    .map((dataset) => {
      const inboxThings = getThingAll(dataset);
      return inboxThings.map((item) => {
        const baseInboxItem = mapThingToInboxItem(item);

        switch (baseInboxItem.type) {
          case 'Access Request':
            return mapThingToAccessRequest(item, baseInboxItem);
          case 'Information':
            return mapThingToInformation(item, baseInboxItem);
          default:
            return baseInboxItem;
        }
      });
    })
    .flat();

  return inboxItems;
}

export async function sendInvitation(
  session: Session | null,
  receiverPod: string | null,
  invitation: Invitation | undefined
) {
  if (!session) {
    throw new Error('No session found');
  }

  if (!receiverPod || !invitation) {
    throw new Error(`Could not send invitation, some credentials were null`);
  }

  const [err, receiver] = await safeCall(
    fetchProfileData(session, receiverPod)
  );

  if (err || !receiver) {
    throw new Error('Failed to fetch receiver profile');
  }

  const today = new Date(Date.now());
  const isoDate = today.toISOString();

  const notificationToSend = buildThing(
    createThing({
      name: `#invitation-${isoDate}`,
    })
  )
    .addUrl(RDF.type, INVITATION_SCHEMA.inboxItem)
    .addStringNoLocale(INVITATION_SCHEMA.type, 'Invitation')
    .addStringNoLocale(INVITATION_SCHEMA.name, invitation.senderName)
    .addStringNoLocale(INVITATION_SCHEMA.email, invitation.email)
    .addStringNoLocale(INVITATION_SCHEMA.webId, invitation.webId)
    .addStringNoLocale(INVITATION_SCHEMA.podUrl, invitation.podUrl)
    .addStringNoLocale(INVITATION_SCHEMA.time, isoDate)
    .build();

  await sendToInbox(session, receiverPod, notificationToSend);

  updateAgentAccess({
    session,
    containerUrl: `${invitation.podUrl}${BASE_APP_CONTAINER}/Profile`,
    agentWebId: receiver.webId,
    modes: ['Read', 'Write'],
  });

  await sendInvitationMail({
    email: receiver.email,
    receiver: receiver.name,
    sender: session.info.webId ?? '',
  });
}

export async function sendInformation(
  session: Session | null,
  senderPod: string | null,
  receiverPod: string | null,
  informationHeader: string,
  informationBody: string
) {
  if (!session) {
    throw new Error('No session found');
  }

  const [_, sender] = await safeCall(fetchProfileData(session, senderPod));

  if (!receiverPod || !senderPod) {
    throw new Error(`Could not send information, receiver or sender was null`);
  }

  const today = new Date(Date.now());
  const isoDate = today.toISOString();

  const informationToSend = buildThing(
    createThing({
      name: `#information-${isoDate}`,
    })
  )
    .addUrl(RDF.type, INFORMATION_SCHEMA.inboxItem)
    .addStringNoLocale(INFORMATION_SCHEMA.type, 'Information')
    .addStringNoLocale(INFORMATION_SCHEMA.name, sender!.name)
    .addStringNoLocale(INFORMATION_SCHEMA.email, sender!.email)
    .addStringNoLocale(INFORMATION_SCHEMA.webId, sender!.webId)
    .addStringNoLocale(INFORMATION_SCHEMA.podUrl, senderPod)
    .addStringNoLocale(INFORMATION_SCHEMA.time, isoDate)
    .addStringNoLocale(INFORMATION_SCHEMA.informationHeader, informationHeader)
    .addStringNoLocale(INFORMATION_SCHEMA.informationBody, informationBody)
    .build();

  await sendToInbox(session, receiverPod, informationToSend);
}

/**
 * Sends a thing to a receivers inbox
 * @param session of the user that sends the thing
 * @param receiverPod the url of the receiver of the thing
 * @param a built thing that is to be sent to the receivers inbox
 */
async function sendToInbox(
  session: Session,
  receiverPod: string,
  thing: Thing
) {
  const invitationUrl = `${receiverPod}${BASE_APP_CONTAINER}/${INBOX_CONTAINER}/`;

  let dataset = createSolidDataset();
  dataset = setThing(dataset, thing);
  const datasetString = await solidDatasetAsTurtle(dataset);

  await session.fetch(invitationUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/turtle',
    },
    body: datasetString,
  });
}

/**
 * Sends an access request to a pod
 * // TODO: MOVE THIS INTO NEW PROJECT FOR THIRD PARTY ACCESS
 * @param session of the user that sends the request
 * @param receiverPod the pod of the receiver that the sender wishes to request access to
 * @param receiverWebId the webID of the receiver
 * @param accessRequest the request object containing information about the sender
 */
export async function sendAccessRequest(
  session: Session | null,
  receiverPod: string | null,
  receiverWebId: string | null,
  accessRequest: AccessRequest | undefined
) {
  if (!session) {
    throw new Error('No session found');
  }

  if (!receiverPod || !receiverWebId || !accessRequest) {
    throw new Error(
      `Could not send access request, some credentials were null`
    );
  }
  // handle dates
  const today = new Date(Date.now());
  const isoDate = today.toISOString();

  const notificationToSend = buildThing(
    createThing({
      name: `#access-request-${isoDate}`,
    })
  )
    .addUrl(RDF.type, ACCESS_REQUEST_SCHEMA.inboxItem)
    .addStringNoLocale(ACCESS_REQUEST_SCHEMA.type, 'Access Request')
    .addStringNoLocale(ACCESS_REQUEST_SCHEMA.name, accessRequest.senderName)
    .addStringNoLocale(ACCESS_REQUEST_SCHEMA.webId, accessRequest.webId)
    .addStringNoLocale(ACCESS_REQUEST_SCHEMA.podUrl, accessRequest.podUrl)
    .addStringNoLocale(ACCESS_REQUEST_SCHEMA.time, isoDate)
    .addStringNoLocale(
      ACCESS_REQUEST_SCHEMA.organization,
      accessRequest.organization!
    )
    .addStringNoLocale(
      ACCESS_REQUEST_SCHEMA.accessReason,
      accessRequest.accessReason!
    )

    .build();
  await sendToInbox(session, receiverPod, notificationToSend);
}

export async function createInbox(session: Session, pod: string) {
  if (!session.info.webId) {
    throw new Error('No session found');
  }
  const invitationUrl = `${pod}${BASE_APP_CONTAINER}/${INBOX_CONTAINER}`;

  // Use createContainerAt to create the container at the specified URL
  await createContainerAt(
    invitationUrl, // The URL of the container you want to create
    { fetch: session.fetch } // Use the session's fetch for authentication
  );

  // Set the public access permissions on the container (as before)
  await setPublicAccess({
    session,
    url: invitationUrl,
    modes: ['Append'],
  });
}

/**
 * Delete an item from the inbox
 * @param session of the user requesting the deletion
 * @param pod of the user to delete the item from
 * @param date of the item to delete
 */
async function deleteInboxItem(
  session: Session | null,
  pod: string | null,
  date: string
) {
  if (!session || !pod) {
    throw new Error('Could not find session');
  }

  const inboxUrl = `${pod}${BASE_APP_CONTAINER}/${INBOX_CONTAINER}`;

  const inboxDataset = await getSolidDataset(inboxUrl, {
    fetch: session.fetch,
  });

  const inboxThings = getThingAll(inboxDataset);

  for (const item of inboxThings) {
    const dataset = await getSolidDataset(item.url, { fetch: session.fetch });
    const things = getThingAll(dataset);

    for (const thing of things) {
      const inboxItemDate: string =
        thing.predicates[INBOX_ITEM_SCHEMA.time]?.literals?.[
          'http://www.w3.org/2001/XMLSchema#string'
        ]?.[0] || 'Unknown';

      if (inboxItemDate === date) {
        await deleteSolidDataset(item.url, { fetch: session.fetch });
      }
    }
  }
}

export async function declineInvitation(
  session: Session | null,
  pod: string | null,
  date: string
) {
  if (!session || !pod) {
    throw new Error('Session or pod not found');
  }
  await deleteInboxItem(session, pod, date);
}

/**
 * Accepts an invitation to join the team
 * @param session of the user accepting the invitation
 * @param receiverPod pod of the user accepting the invitation
 * @param senderPod pod of the user to be accepted (user that sent the request)
 * @param senderWebId id of the user to be accepted (user that sent the request)
 * @param email email of the user to be accepted (user that sent the request)
 * @param role the role the user will have in the team
 * @param date the date of the initial invitation request
 */
export async function acceptInvitation({
  session,
  receiverPod,
  senderPod,
  senderWebId,
  email,
  role,
  date,
  teamName,
}: {
  session: Session;
  receiverPod: string;
  senderPod: string;
  senderWebId: string;
  email: string;
  role: string;
  date: string;
  teamName: string;
}) {
  if (!session.info.webId) {
    throw new Error('No session found');
  }

  const teamUrl = await fetchTeamUrl(session, receiverPod);

  await updateAppProfile(session, senderPod, { teamUrl });

  const [teamGrantError, _] = await safeCall(
    updateAgentAccess({
      session,
      containerUrl: `${receiverPod}${BASE_APP_CONTAINER}/Team`,
      agentWebId: senderWebId,
      modes: ['Read'],
    })
  );

  if (teamGrantError) {
    throw new Error('Could not grant read access to team');
  }

  const [addMemberError, ___] = await safeCall(
    addMemberToTeam(session, receiverPod, senderWebId, senderPod, role)
  );

  if (addMemberError) {
    throw new Error('Could not add member to team');
  }

  await sendAcceptMail({
    email,
    receiver: senderWebId,
    sender: session.info.webId,
    team: teamName,
  });
  await declineInvitation(session, receiverPod, date);
}

function mapThingToInboxItem(thing: any): InboxItem {
  return {
    type: getStringNoLocale(thing, INBOX_ITEM_SCHEMA.type) ?? '',
    senderName: getStringNoLocale(thing, INBOX_ITEM_SCHEMA.name) ?? '',
    webId: getStringNoLocale(thing, INBOX_ITEM_SCHEMA.webId) ?? '',
    email: getStringNoLocale(thing, INBOX_ITEM_SCHEMA.email) ?? '',
    podUrl: getStringNoLocale(thing, INBOX_ITEM_SCHEMA.podUrl) ?? '',
    date: getStringNoLocale(thing, INBOX_ITEM_SCHEMA.time) ?? '',
    organization:
      getStringNoLocale(thing, INBOX_ITEM_SCHEMA.organization) ?? '',
  };
}
function mapThingToAccessRequest(
  thing: any,
  baseInboxItem: InboxItem
): AccessRequest {
  return {
    type: baseInboxItem.type,
    senderName: baseInboxItem.senderName,
    webId: baseInboxItem.webId,
    email: baseInboxItem.email,
    podUrl: baseInboxItem.podUrl,
    date: baseInboxItem.date,
    organization: baseInboxItem.organization,
    accessReason:
      getStringNoLocale(thing, ACCESS_REQUEST_SCHEMA.accessReason) ?? '',
  };
}
function mapThingToInformation(
  thing: any,
  baseInboxItem: InboxItem
): Information {
  return {
    type: baseInboxItem.type,
    senderName: baseInboxItem.senderName,
    webId: baseInboxItem.webId,
    email: baseInboxItem.email,
    podUrl: baseInboxItem.podUrl,
    date: baseInboxItem.date,
    informationHeader:
      getStringNoLocale(thing, INFORMATION_SCHEMA.informationHeader) ?? '',
    informationBody:
      getStringNoLocale(thing, INFORMATION_SCHEMA.informationBody) ?? '',
  };
}
