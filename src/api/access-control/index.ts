import { Session } from '@inrupt/solid-client-authn-browser';
import { Permission } from '@/entities/permissions';
import { getAccessControlService } from './utils';
import {
  setPublicAccess as inrupt_setPublicAccess,
  getAgentAccessAll as inrupt_getAgentAccessAll,
} from '@inrupt/solid-client/universal';

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
