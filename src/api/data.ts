import {
  DataDeletionRequest,
  DataInfo,
  DataInfoStatus,
} from '@/entities/data-info';
import { Session } from '@inrupt/solid-client-authn-browser';
import { BASE_APP_CONTAINER, DATA_CONTAINER, paths } from './paths';
import {
  DATA_DELETION_REQUEST_SCHEMA,
  DATA_INFO_SCHEMA,
} from '@/schemas/data-info';
import { logAccessRequest } from './access-history';
import {
  createContainerAt,
  deleteContainer,
  deleteSolidDataset,
  getDate,
  getDatetime,
  getFile,
  getSolidDataset,
  getStringNoLocale,
  getThingAll,
  deleteFile as inrupt_deleteFile,
  saveFileInContainer,
  Thing,
} from '@inrupt/solid-client';
import { SessionNotSetException } from '@/exceptions/session-exceptions';
import { safeCall } from '@/utils';

const categories = [
  'personal-data',
  'football-data',
  'event-data',
  'tracking-data',
  'biometric-data',
  'health-data',
];

/**
 * Fetches all data of a given category
 * @param session of the user requesting the data
 * @param pod of the user the data belongs to
 * @param category of the data to fetch
 */
export async function fetchDataByCategory(
  session: Session | null,
  pod: string | null,
  category: string
): Promise<DataInfo[]> {
  if (!session || !pod) {
    throw new Error('Session and pod are required');
  }

  if (!categories.includes(category)) {
    throw new Error('Not a supported category');
  }

  const datasetUrl = `${paths.root(pod)}${category}/`;
  const dataset = await getSolidDataset(datasetUrl, {
    fetch: session.fetch,
  });
  const things = getThingAll(dataset).filter(
    (thing) => thing.url !== datasetUrl && !thing.url.endsWith('/files/')
  );

  return await Promise.all(
    things.map(async (thing) => {
      const innerDataset = await getSolidDataset(thing.url, {
        fetch: session.fetch,
      });
      const innerThing = getThingAll(innerDataset)[0];

      return mapThingToDataInfo(innerThing);
    })
  );
}

/**
 * Fetch a single data item
 * @param session of the user requesting the data
 * @param url of the data to fetch
 */
export async function fetchData(
  session: Session | null,
  url: string
): Promise<DataInfo> {
  if (!session) {
    throw new SessionNotSetException('User is not logged in');
  }

  const dataset = await getSolidDataset(url, { fetch: session.fetch });
  const thing = getThingAll(dataset)[0];

  return mapThingToDataInfo(thing);
}

/**
 * Deletes data from a pod
 * @param session of the user requesting the deletion
 * @param pod of the user where the data is stored
 * @param data the data to be deleted
 */
export async function deleteData(
  session: Session | null,
  pod: string | null,
  data: DataInfo[]
) {
  if (!session || !pod) {
    throw new SessionNotSetException('Session and pod are required');
  }

  await Promise.all(
    data.map(async (item) => {
      const [fileError] = await safeCall(deleteFile(session, item.file.url));
      const [datasetError] = await safeCall(
        deleteSolidDataset(item.url, { fetch: session.fetch })
      );

      if (fileError) {
        console.error('Error deleting file', fileError);
      }
      if (datasetError) {
        console.error('Error deleting file info', datasetError);
      }
    })
  );
}

/**
 * Fetches all deletion requests for a user
 * @param session of the user requesting the requests
 * @param pod of the user where the requests are stored
 */
export async function fetchDeletionRequests(
  session: Session | null,
  pod: string | null
): Promise<DataDeletionRequest[]> {
  if (!session || !pod) {
    throw new SessionNotSetException('Session and pod are required');
  }

  const datasetUrl = paths.deletionRequests(pod);
  const dataset = await getSolidDataset(datasetUrl, {
    fetch: session.fetch,
  });
  const things = getThingAll(dataset).filter(
    (thing) => thing.url !== datasetUrl
  );

  return await Promise.all(
    things.map(async (thing) => {
      const url = thing.url;
      const dataset = await getSolidDataset(url, { fetch: session.fetch });
      const deletionRequestThing = getThingAll(dataset)[0];
      return mapThingToDeletionRequest(deletionRequestThing);
    })
  );
}

/**
 * Returns the content of a file as a JSON object
 * @param session of the requesting user
 * @param url to the file
 * @returns a blob and its mimeType
 */
export async function fetchFile(session: Session | null, urlString: string) {
  if (!session || !session.info.webId) {
    throw new SessionNotSetException('User is not logged in');
  }

  const podUrl = urlString.split(`${BASE_APP_CONTAINER}/`)[0];
  const file = await getFile(urlString, { fetch: session.fetch });
  const fileName =
    file.internal_resourceInfo.sourceIri.split('/').pop() ??
    new Date().toISOString();

  await logAccessRequest({
    session,
    pod: podUrl,
    resource: urlString,
    action: 'Read',
  });

  return { blob: file, mimeType: file.type, name: fileName };
}

/**
 * Uploads a file to a container
 * @param session of the user requestin the upload
 * @param pod url of the pod to upload the file
 * @param path within the "app/data" container to upload the file
 * @param file to upload
 */
export async function uploadFile(
  session: Session | null,
  pod: string,
  path: string,
  file: File
) {
  if (!session || !session.info.webId) {
    throw new SessionNotSetException('User is not logged in');
  }

  await logAccessRequest({
    session,
    pod,
    resource: `${pod}${BASE_APP_CONTAINER}/${DATA_CONTAINER}/${path}/${file.name}`,
    action: 'Write',
  });

  await saveFileInContainer(path, file, {
    fetch: session.fetch,
  });
}

/**
 * Deletes a file from a pod
 * @param session of the user requesting the delete
 * @param url to the file to delete
 */
export async function deleteFile(session: Session | null, url: string) {
  if (!session) {
    throw new Error('User is not logged in');
  }

  await inrupt_deleteFile(url, { fetch: session.fetch });
}

/**
 * Creates a new folder in the given path
 * @param session of the user requesting the folder creation
 * @param pod where the folder should be created
 * @param path within the /app/data/ folder where the new folder should be created
 * @param name of the new folder
 */
export async function createNewFolder({
  session,
  pod,
  path,
  name,
}: {
  session: Session | null;
  pod: string;
  path: string;
  name: string;
}) {
  if (!session) {
    throw new Error('Session not found');
  }

  let folderUrl;
  if (path === '') {
    folderUrl = `${pod}${BASE_APP_CONTAINER}/${DATA_CONTAINER}/${name}`;
  } else {
    folderUrl = `${pod}${BASE_APP_CONTAINER}/${DATA_CONTAINER}/${path}/${name}`;
  }

  const [err, _] = await safeCall(
    createContainerAt(folderUrl, { fetch: session.fetch })
  );

  if (err) {
    if (err.message.includes('412')) {
      throw new Error('Folder already exists');
    }
    if (err.message.includes('403') || err.message.includes('401')) {
      throw new Error('You do not have permission to create a folder here');
    }
    throw new Error('Something went wrong, please try again later.');
  }

  await logAccessRequest({
    session,
    pod: pod,
    resource: folderUrl,
    action: 'Write',
  });
}

/**
 * Deletes a folder and all its contents
 * @param session of the user requesting the deletion
 * @param url of the folder to be deleted
 */
export async function deleteFolder(session: Session | null, url: string) {
  if (!session) {
    throw new Error('User not logged in');
  }

  const dataset = await getSolidDataset(url, { fetch: session.fetch });
  const things = getThingAll(dataset);

  await Promise.all(
    things
      .filter((thing) => thing.url !== url)
      .map(async (thing) => {
        if (isFolder(thing)) {
          await deleteFolder(session, thing.url);
        } else {
          await deleteFile(session, thing.url);
        }
      })
  );

  await deleteContainer(url, { fetch: session.fetch });
}

/**
 * Checks if a Thing is a folder or file
 * @param thing to check
 * @returns true if the Thing is a folder, false otherwise
 */
function isFolder(thing: Thing) {
  return thing.url.endsWith('/');
}

function mapThingToDataInfo(thing: Thing): DataInfo {
  return {
    url: thing.url,
    file: {
      url: getStringNoLocale(thing, DATA_INFO_SCHEMA.fileUrl) ?? '',
      name: getStringNoLocale(thing, DATA_INFO_SCHEMA.fileName) ?? '',
    },
    uploader: {
      webId: getStringNoLocale(thing, DATA_INFO_SCHEMA.webId) ?? '',
      name: getStringNoLocale(thing, DATA_INFO_SCHEMA.name) ?? '',
    },
    uploadedAt: getDate(thing, DATA_INFO_SCHEMA.uploadedAt) ?? new Date(),
    reason: getStringNoLocale(thing, DATA_INFO_SCHEMA.reason) ?? '',
    location: getStringNoLocale(thing, DATA_INFO_SCHEMA.location) ?? '',
    status: (getStringNoLocale(thing, DATA_INFO_SCHEMA.status) ??
      '') as DataInfoStatus,
  };
}

function mapThingToDeletionRequest(thing: Thing): DataDeletionRequest {
  const confirmerName = getStringNoLocale(
    thing,
    DATA_DELETION_REQUEST_SCHEMA.senderName
  );
  const confirmerWebId = getStringNoLocale(
    thing,
    DATA_DELETION_REQUEST_SCHEMA.senderWebId
  );
  const confirmer =
    confirmerName && confirmerWebId
      ? { name: confirmerName, webId: confirmerWebId }
      : undefined;

  return {
    id: getStringNoLocale(thing, DATA_DELETION_REQUEST_SCHEMA.id) ?? '',
    sender: {
      name:
        getStringNoLocale(thing, DATA_DELETION_REQUEST_SCHEMA.senderName) ?? '',
      webId:
        getStringNoLocale(thing, DATA_DELETION_REQUEST_SCHEMA.senderWebId) ??
        '',
    },
    sentAt:
      getDatetime(thing, DATA_DELETION_REQUEST_SCHEMA.sentAt) ?? new Date(),
    confirmer,
    confirmedAt:
      getDatetime(thing, DATA_DELETION_REQUEST_SCHEMA.confirmedAt) ?? undefined,
    status: getStringNoLocale(
      thing,
      DATA_DELETION_REQUEST_SCHEMA.status
    ) as DataInfoStatus,
    data: JSON.parse(
      getStringNoLocale(thing, DATA_DELETION_REQUEST_SCHEMA.data) ?? '[]'
    ) as { location: string; file: string }[],
  };
}
