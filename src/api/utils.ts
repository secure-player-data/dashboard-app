import { Session } from '@inrupt/solid-client-authn-browser';
import {
  deleteSolidDataset,
  getPodUrlAll,
  getSolidDataset,
  getThingAll,
  isContainer,
} from '@inrupt/solid-client';

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
 * Purges a container and all its content
 * @param container path to the container to be purged
 * @param session of the user requesting the purge
 */
export async function purgeContainer(container: string, session: Session) {
  const parent = await getSolidDataset(container, { fetch: session.fetch });
  const things = getThingAll(parent);
  for (const thing of things) {
    if (isContainer(thing.url) && thing.url !== container) {
      await purgeContainer(thing.url, session);
    } else {
      await deleteSolidDataset(thing.url, { fetch: session.fetch });
    }
  }
}
