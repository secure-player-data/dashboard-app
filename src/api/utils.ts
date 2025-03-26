import { Session } from '@inrupt/solid-client-authn-browser';
import { getPodUrlAll } from '@inrupt/solid-client';

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
