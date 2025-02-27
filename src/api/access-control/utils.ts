import { Session } from '@inrupt/solid-client-authn-browser';
import { IAccessControl } from './interfaces';
import { safeCall } from '@/utils';
import { isAcpControlled } from '@inrupt/solid-client/acp/acp';
import { Acp } from './acp';
import { Acl } from './acl';
import { getSolidDataset, getThingAll, Thing } from '@inrupt/solid-client';
import { paths } from '../paths';
import { getAgentAccessAll } from '.';
import { SessionNotSetException } from '@/exceptions/session-exceptions';
import { resource } from '@/entities/data/resource';

/**
 * Returns the correct access control service based on the protocol used
 * by the user's pod provider
 * @param session of the user requesting the access control service
 * @param containerUrl url to the container to get the access control service for
 */
export async function getAccessControlService(
  session: Session,
  containerUrl: string
): Promise<IAccessControl> {
  const [err, usesAcp] = await safeCall(
    isAcpControlled(containerUrl, { fetch: session.fetch })
  );
  if (err) {
    throw new Error('Error checking if ACP is used');
  }

  if (usesAcp) {
    return Acp.getInstance();
  }
  return Acl.getInstance();
}

/**
 * creates a list of resources including:
 * * path
 * * type (folder or file)
 * * access level (shared, private or public)
 * @param session of the logged in user
 * @param pod url of the pod the app is working with
 * TODO: Create a tanstack use-case for this
 */
export async function getResourceList(
  session: Session | null,
  pod: string | null
) {
  if (!session || !pod) {
    throw new SessionNotSetException('No session provided');
  }
  const container = await getSolidDataset(paths.root(pod), {
    fetch: session.fetch,
  });

  let things = getThingAll(container);

  const excludeUrls = new Set(['', 'inbox/', 'access history/']);
  things = things.reduce<Thing[]>((acc, thing) => {
    const url = thing.url.split('secure-player-data/')[1]; // Get the last part of the URL
    if (!excludeUrls.has(url!)) {
      acc.push(thing as never);
    }
    return acc;
  }, []);

  const resourceList: resource[] = await Promise.all(
    things.map(async (thing) => {
      const url = thing.url;
      const path = thing.url.split('secure-player-data/');
      const accesses = await getAgentAccessAll({ session, url });

      const accessKeys = Object.keys(accesses || {}); // Ensuring accesses is not undefined
      let accessLevel = 'private';

      // check access levels
      if (accessKeys.includes('http://www.w3.org/ns/solid/acp#PublicAgent')) {
        accessLevel = 'public';
      } else if (accessKeys.length > 1) {
        accessLevel = 'shared';
      }

      return {
        path: path[1],
        type: path[1].endsWith('/') ? 'folder' : 'file',
        accessLevel,
      };
    })
  );

  return resourceList;
}
