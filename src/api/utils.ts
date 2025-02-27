import { SessionNotSetException } from '@/exceptions/session-exceptions';
import { Session } from '@inrupt/solid-client-authn-browser';
import { BASE_APP_CONTAINER, DATA_CONTAINER } from './paths';
import {
  deleteFile as inrupt_deleteFile,
  getFile,
  saveFileInContainer,
  getPodUrlAll,
  createContainerAt,
  getSolidDataset,
  getThingAll,
  deleteContainer,
  Thing,
} from '@inrupt/solid-client';
import { logAccessRequest } from './access-history';
import { safeCall } from '@/utils';

/**
 * Returns the url of the first pod found for the user
 * @param session of the user to get the pod of
 * @returns url of the pod
 */
export async function getPodUrl(session: Session): Promise<string> {
  const pods = await getPodUrlAll(session.info.webId!, {
    fetch: session.fetch,
  });

  if (pods.length === 0) {
    throw new Error('No pod found');
  }

  return pods[0];
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
