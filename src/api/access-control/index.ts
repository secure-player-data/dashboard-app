import { Session } from '@inrupt/solid-client-authn-browser';
import { Permission } from '@/entities/permissions';
import { getAccessControlService } from './utils';
import {
  NoControlAccessError,
  NoControlAccessErrors,
} from '@/exceptions/outsourcing-exception';
import { safeCall } from '@/utils';
import {
  setPublicAccess as inrupt_setPublicAccess,
  getAgentAccessAll as inrupt_getAgentAccessAll,
} from '@inrupt/solid-client/universal';
import { SessionNotSetException } from '@/exceptions/session-exceptions';
import { permissionDetail, resource } from '@/entities/data/access-control';
import { Member } from '@/entities/data/member';
import { getThingAll, getSolidDataset, Thing } from '@inrupt/solid-client';
import { paths } from '../paths';
import { sendInformation } from '../inbox';
import { Profile } from '@/entities/data/profile';
import { isAcpControlled } from '@inrupt/solid-client/acp/acp';

/**
 * Updates the permissions of an agent for a container and its children
 * @param session of the user requesting the update
 * @param containerUrl url to the container to update permissions for
 * @param agentWebId id of the agent to update permissions for
 * @param modes to give the agent
 */
export async function updateAgentAccess({
  session,
  containerUrl,
  agentWebId,
  modes,
}: {
  session: Session;
  containerUrl: string;
  agentWebId: string;
  modes: Permission[];
}) {
  const service = await getAccessControlService(session, containerUrl);
  await service.updateAgentAccess({
    session,
    containerUrl,
    agentWebId,
    modes,
  });
}

/**
 * Sets the public access permissions for a resource
 * @param session of the user requesting the update
 * @param url of the resource to update the public permissions for
 * @param modes to give the public
 */
export async function setPublicAccess({
  session,
  url,
  modes,
}: {
  session: Session;
  url: string;
  modes: Permission[];
}) {
  await inrupt_setPublicAccess(
    url,
    {
      read: modes.includes('Read'),
      append: modes.includes('Append'),
      write: modes.includes('Write'),
      controlRead: modes.includes('Control'),
      controlWrite: modes.includes('Control'),
    },
    {
      fetch: session.fetch,
    }
  );
}

/**
 * Returns a map of members that have some access rights to the resource
 * at the given url. The map is keyed by the member's webId and the value
 * is an object with the permissions the member has:
 * { read: true/false, write: true/false, append: true/false, control: true/false }
 * @param session of the user requesting the information
 * @param url of the resource to get the members with access for
 */
export async function getAgentAccessAll({
  session,
  url,
}: {
  session: Session;
  url: string;
}) {
  const agentAccess = await inrupt_getAgentAccessAll(url, {
    fetch: session.fetch,
  });
  return agentAccess;
}

/**
 * creates a list of resources including:
 * * path
 * * type (folder or file)
 * * access level (shared, private or public)
 * @param session of the logged in user
 * @param pod url of the pod the app is working with
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

/**
 * Wrapper for getAgentAccessAll
 * @param session of the logged in user
 * @param url of the path to get permissions
 */
export async function getPermissionDetails(
  session: Session | null,
  url: string | null
) {
  if (!session || !url) {
    throw new SessionNotSetException('No session provided');
  }

  const [error, data] = await safeCall(
    getAgentAccessAll({
      session,
      url,
    })
  );

  if (!data || error) {
    return [];
  }

  const permissionDetails: permissionDetail[] = Object.entries(data).map(
    ([agent, accessModes]) => ({
      agent,
      read: accessModes.read,
      write: accessModes.write,
      append: accessModes.append,
      control: accessModes.controlRead && accessModes.controlWrite,
    })
  );

  return permissionDetails;
}

/**
 * Uses the sessions control access to outsource give read access to sections of a players pod, for a specified webid
 * @param session of the logged in user
 * @param profile of the logged in user
 * @param pod of the logged in user
 * @param reason for outsourcing the data
 * @param dataOwners a list of the owners of the data
 * @param resourceUrls a list of the resources of the dataowners that should be outsourced
 * @param dataReceiver the receiver of the outsoured data
 */
export async function outsourcePlayerData(
  session: Session,
  profile: Profile,
  pod: string,
  dataOwners: Member[],
  resourceUrls: string[],
  dataReceiver: string,
  reason: string
) {
  let failedAccesses: { urls: string[]; owner: Member }[] = [];
  let grantedAccesses: { urls: string[]; owner: Member }[] = [];

  const allPromises = dataOwners.flatMap((owner) =>
    resourceUrls.map(async (url) => {
      console.log('url', url);
      const [error, _] = await safeCall(
        updateAgentAccess({
          session: session,
          containerUrl: `${paths.root(owner.pod)}/${url}`,
          agentWebId: dataReceiver,
          modes: ['Read'],
        })
      );

      if (error) {
        if (error instanceof NoControlAccessError) {
          const existingOwner = failedAccesses.find(
            (entry) => entry.owner === owner
          );

          if (existingOwner) {
            existingOwner.urls.push(url);
          } else {
            failedAccesses.push({ owner: owner, urls: [url] });
          }
        }
        return { error, url, owner: owner.name };
      }

      if (!error) {
        const existingOwner = grantedAccesses.find(
          (entry) => entry.owner === owner
        );

        if (existingOwner) {
          existingOwner.urls.push(url);
        } else {
          grantedAccesses.push({ owner: owner, urls: [url] });
        }
      }
      return null;
    })
  );

  await Promise.allSettled(allPromises);

  grantedAccesses.forEach(async (grantedAccess) => {
    const urlsList = grantedAccess.urls.join(', ');
    await sendInformation(
      session,
      pod,
      grantedAccess.owner.pod,
      'Your data was outsourced',
      `${profile.name} has shared the following of your resources with ${dataReceiver} ; ${urlsList} ; ${reason}`
    );
  });

  return { successful: grantedAccesses, failed: failedAccesses };
}

/**
 * Checks is a pod uses ACP
 * @param session of the user requesting the check
 * @param pod of the user to check
 * @returns true if the pod uses ACP, false otherwise
 */
export async function usesAcp(session: Session | null, pod: string | null) {
  if (!session || !pod) {
    throw new Error('Session and pod are required');
  }

  const [err, usesAcp] = await safeCall(
    isAcpControlled(paths.root(pod), { fetch: session.fetch })
  );

  if (err) {
    throw new Error('Error checking if ACP is used');
  }

  return usesAcp || false;
}
